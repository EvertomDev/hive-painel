import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import TelegramBot from 'node-telegram-bot-api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

const telegramSessions = new Map();
let whatsappManager = null;

// Carrega WhatsApp apenas se as dependências estiverem instaladas (uso local/VPS)
try {
  const { default: ww } = await import('./server/whatsappManager.js');
  whatsappManager = ww;
} catch (e) {
  console.log('WhatsApp não disponível neste ambiente. Instale whatsapp-web.js e puppeteer para habilitar.');
}

function telegramValidateToken(token) {
  const bot = new TelegramBot(token, { polling: false });
  return bot.getMe();
}

function telegramStartBot(token) {
  if (telegramSessions.has(token)) return { ok: true, info: telegramSessions.get(token).info };
  const bot = new TelegramBot(token, { polling: true });
  const session = { bot, info: null, messages: [] };
  telegramSessions.set(token, session);
  bot.getMe().then(me => { session.info = me; }).catch(() => {});
  bot.on('message', (msg) => {
    session.messages.unshift({
      id: msg.message_id,
      chatId: msg.chat.id,
      from: msg.from?.username || msg.from?.first_name || 'Usuário',
      text: msg.text || '[mídia]',
      date: new Date(msg.date * 1000).toISOString(),
      direction: 'in',
      platform: 'telegram',
    });
    if (session.messages.length > 200) session.messages.pop();
  });
  return { ok: true };
}

async function telegramSendMessage(token, chatId, text) {
  const session = telegramSessions.get(token);
  if (!session) throw new Error('Inicie o bot primeiro');
  const sent = await session.bot.sendMessage(chatId, text);
  return {
    id: sent.message_id,
    chatId: sent.chat.id,
    from: session.info?.username || 'Você',
    text,
    date: new Date().toISOString(),
    direction: 'out',
    platform: 'telegram',
  };
}

function telegramGetMessages(token, chatId = null) {
  const session = telegramSessions.get(token);
  if (!session) return [];
  let msgs = session.messages;
  if (chatId) msgs = msgs.filter(m => String(m.chatId) === String(chatId));
  return msgs.slice(0, 100);
}

function telegramGetChats(token) {
  const session = telegramSessions.get(token);
  if (!session) return [];
  const chats = {};
  session.messages.forEach(m => {
    if (!chats[m.chatId]) {
      chats[m.chatId] = { chatId: m.chatId, name: m.from, platform: 'telegram', lastMessage: m.text, lastDate: m.date, unread: 0 };
    }
    if (m.direction === 'in') chats[m.chatId].unread += 1;
    chats[m.chatId].lastMessage = m.text;
    chats[m.chatId].lastDate = m.date;
  });
  return Object.values(chats).sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));
}

function whatsappUnavailable() {
  return { ok: false, error: 'WhatsApp requer um servidor Node.js contínuo. No Vercel apenas Telegram está disponível. Use VPS/Railway/Render para WhatsApp.' };
}

// ========================
// Telegram
// ========================
app.post('/api/telegram/me', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ ok: false, error: 'Token não fornecido' });
    const me = await telegramValidateToken(token);
    res.json({ ok: true, result: me });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post('/api/telegram/start', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ ok: false, error: 'Token não fornecido' });
    res.json(telegramStartBot(token));
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post('/api/telegram/send-message', async (req, res) => {
  try {
    const { token, chatId, text } = req.body;
    if (!token || !chatId || !text) return res.status(400).json({ ok: false, error: 'Dados incompletos' });
    const message = await telegramSendMessage(token, chatId, text);
    res.json({ ok: true, message });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post('/api/telegram/messages', async (req, res) => {
  try {
    const { token, chatId } = req.body;
    if (!token) return res.status(400).json({ ok: false, error: 'Token não fornecido' });
    res.json({ ok: true, messages: telegramGetMessages(token, chatId) });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post('/api/telegram/chats', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ ok: false, error: 'Token não fornecido' });
    res.json({ ok: true, chats: telegramGetChats(token) });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

// ========================
// WhatsApp
// ========================
app.post('/api/whatsapp/start', async (req, res) => {
  if (!whatsappManager) return res.status(503).json(whatsappUnavailable());
  // ... resto omitido, usa whatsappManager
});

app.post('/api/whatsapp/status', async (req, res) => {
  if (!whatsappManager) return res.status(503).json(whatsappUnavailable());
});

app.post('/api/whatsapp/send-message', async (req, res) => {
  if (!whatsappManager) return res.status(503).json(whatsappUnavailable());
});

app.post('/api/whatsapp/messages', async (req, res) => {
  if (!whatsappManager) return res.status(503).json(whatsappUnavailable());
});

app.post('/api/whatsapp/chats', async (req, res) => {
  if (!whatsappManager) return res.status(503).json(whatsappUnavailable());
});

app.post('/api/whatsapp/logout', async (req, res) => {
  if (!whatsappManager) return res.status(503).json(whatsappUnavailable());
});

// SPA fallback
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Zeze Painel rodando em http://localhost:${PORT}`);
});
