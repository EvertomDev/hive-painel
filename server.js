import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTelegramManager } from './server/telegramManager.js';
import { getWhatsAppManager } from './server/whatsappManager.js';
import * as contentEngine from './server/contentEngine.js';
import { generatePixQrCode } from './server/pixGateway.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

const telegram = getTelegramManager();
const whatsapp = getWhatsAppManager();

// ========================
// Telegram
// ========================
app.post('/api/telegram/me', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ ok: false, error: 'Token não fornecido' });
    const data = await telegram.validateToken(token);
    res.json(data);
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post('/api/telegram/start', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ ok: false, error: 'Token não fornecido' });
    const result = telegram.startBot(token);
    res.json(result);
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post('/api/telegram/send-message', async (req, res) => {
  try {
    const { token, chatId, text } = req.body;
    if (!token || !chatId || !text) return res.status(400).json({ ok: false, error: 'Dados incompletos' });
    const data = await telegram.sendMessage(token, chatId, text);
    res.json(data);
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post('/api/telegram/messages', async (req, res) => {
  try {
    const { token, chatId } = req.body;
    if (!token) return res.status(400).json({ ok: false, error: 'Token não fornecido' });
    res.json({ ok: true, messages: telegram.getMessages(token, chatId) });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post('/api/telegram/chats', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ ok: false, error: 'Token não fornecido' });
    res.json({ ok: true, chats: telegram.getChats(token) });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

// ========================
// WhatsApp
// ========================
app.post('/api/whatsapp/start', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const result = await whatsapp.startSession(sessionId || 'default', {
      onQr: (id, qr) => {},
      onReady: (id) => {},
      onMessage: (id, msg) => {},
      onError: (id, error) => {},
      onDisconnect: (id) => {},
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post('/api/whatsapp/status', async (req, res) => {
  try {
    const { sessionId } = req.body;
    res.json({ ok: true, ...whatsapp.getStatus(sessionId || 'default') });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post('/api/whatsapp/send-message', async (req, res) => {
  try {
    const { sessionId, chatId, text } = req.body;
    if (!chatId || !text) return res.status(400).json({ ok: false, error: 'chatId e text são obrigatórios' });
    const data = await whatsapp.sendMessage(sessionId || 'default', chatId, text);
    res.json(data);
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post('/api/whatsapp/messages', async (req, res) => {
  try {
    const { sessionId, chatId } = req.body;
    res.json({ ok: true, messages: whatsapp.getMessages(sessionId || 'default', chatId) });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post('/api/whatsapp/chats', async (req, res) => {
  try {
    const { sessionId } = req.body;
    res.json({ ok: true, chats: whatsapp.getChats(sessionId || 'default') });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post('/api/whatsapp/logout', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const data = await whatsapp.logout(sessionId || 'default');
    res.json(data);
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

// ========================
// Content Selling (Grupos)
// ========================
const botSessions = new Map();

app.post('/api/content/start-bot', async (req, res) => {
  try {
    const { name, token, id, groups, pixConfig } = req.body;
    if (!token || !id) return res.status(400).json({ ok: false, error: 'Token e ID obrigatórios' });

    const result = await contentEngine.startBot({
      name: name || 'Bot',
      token,
      id,
      groups: groups || [],
      pixConfig: pixConfig || { pixKey: 'zeze@pix.com', merchantName: 'Zeze' },
    }, {
      onOrder: (order) => {
        botSessions.set(`order_${order.paymentId}`, order);
      },
      onPaymentConfirm: (data) => {
        botSessions.set(`proof_${data.chatId}`, data);
      },
      onContact: (data) => {
        botSessions.set(`contact_${data.chatId}`, data);
      },
    });

    if (result.ok) {
      botSessions.set(`bot_${id}`, { running: true, name, token });
    }

    res.json(result);
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post('/api/content/stop-bot', (req, res) => {
  const { id } = req.body;
  const stopped = contentEngine.stopBot(id);
  botSessions.delete(`bot_${id}`);
  res.json({ ok: stopped });
});

app.get('/api/content/active-bots', (req, res) => {
  res.json({ ok: true, bots: contentEngine.getActiveBots() });
});

app.post('/api/content/send-group-link', async (req, res) => {
  try {
    const { botId, chatId, inviteLink } = req.body;
    const result = await contentEngine.sendGroupLink(botId, chatId, inviteLink);
    res.json(result);
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post('/api/content/send-message', async (req, res) => {
  try {
    const { botId, chatId, text } = req.body;
    const result = await contentEngine.sendMessageToChat(botId, chatId, text);
    res.json(result);
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post('/api/content/generate-pix', async (req, res) => {
  try {
    const { pixKey, merchantName, amount, description, txId } = req.body;
    const result = await generatePixQrCode(pixKey || 'zeze@pix.com', amount, merchantName || 'Zeze', description, txId);
    res.json({ ok: true, ...result });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.get('/api/content/orders', (req, res) => {
  const orders = [];
  for (const [key, value] of botSessions) {
    if (key.startsWith('order_')) orders.push(value);
  }
  res.json({ ok: true, orders });
});

app.get('/api/content/contacts', (req, res) => {
  const contacts = [];
  for (const [key, value] of botSessions) {
    if (key.startsWith('contact_') || key.startsWith('proof_')) contacts.push(value);
  }
  res.json({ ok: true, contacts });
});

// Healthcheck para Railway
app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime(), memory: process.memoryUsage().rss });
});

// SPA fallback
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Zeze Painel rodando em http://0.0.0.0:${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
