import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTelegramManager } from './server/telegramManager.js';
import { getWhatsAppManager } from './server/whatsappManager.js';

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
