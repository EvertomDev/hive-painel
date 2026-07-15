import pkg from 'whatsapp-web.js';
import QRCode from 'qrcode';

const { Client, LocalAuth } = pkg;

const sessions = new Map();

export function getWhatsAppManager() {
  return {
    sessions,
    async startSession(sessionId, callbacks = {}) {
      if (sessions.has(sessionId)) {
        const existing = sessions.get(sessionId);
        if (existing.ready) return { ok: true, status: 'ready', qr: null };
        return { ok: true, status: existing.status, qr: existing.qr };
      }

      return new Promise((resolve) => {
        const session = {
          id: sessionId,
          client: null,
          qr: null,
          status: 'connecting',
          ready: false,
          messages: [],
          info: null,
        };
        sessions.set(sessionId, session);

        const client = new Client({
          authStrategy: new LocalAuth({ dataPath: `./data/whatsapp-${sessionId}` }),
          puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
          },
        });
        session.client = client;

        client.on('qr', async (qr) => {
          session.qr = await QRCode.toDataURL(qr);
          session.status = 'qr';
          if (callbacks.onQr) callbacks.onQr(sessionId, session.qr);
          resolve({ ok: true, status: 'qr', qr: session.qr });
        });

        client.on('ready', () => {
          session.ready = true;
          session.status = 'ready';
          session.info = { name: 'WhatsApp Session' };
          if (callbacks.onReady) callbacks.onReady(sessionId);
        });

        client.on('authenticated', () => {
          session.status = 'authenticated';
        });

        client.on('auth_failure', (msg) => {
          session.status = 'auth_failure';
          sessions.delete(sessionId);
          if (callbacks.onError) callbacks.onError(sessionId, msg);
        });

        client.on('disconnected', () => {
          sessions.delete(sessionId);
          if (callbacks.onDisconnect) callbacks.onDisconnect(sessionId);
        });

        client.on('message_create', async (msg) => {
          if (msg.fromMe) return;
          try {
            const contact = await msg.getContact();
            const message = {
              id: msg.id.id,
              chatId: msg.from,
              from: contact.pushname || contact.number || 'Usuário',
              text: msg.body || '[mídia]',
              date: new Date(msg.timestamp * 1000).toISOString(),
              direction: 'in',
              platform: 'whatsapp',
            };
            session.messages.unshift(message);
            if (session.messages.length > 200) session.messages.pop();
            if (callbacks.onMessage) callbacks.onMessage(sessionId, message);
          } catch (e) {}
        });

        client.initialize().catch(err => {
          sessions.delete(sessionId);
          resolve({ ok: false, error: err.message });
        });

        setTimeout(() => {
          if (session.status === 'connecting') {
            resolve({ ok: true, status: 'connecting', qr: session.qr });
          }
        }, 3000);
      });
    },
    getStatus(sessionId) {
      const session = sessions.get(sessionId);
      if (!session) return { status: 'not_found' };
      return { status: session.status, qr: session.qr, ready: session.ready };
    },
    async sendMessage(sessionId, chatId, text) {
      const session = sessions.get(sessionId);
      if (!session || !session.ready) throw new Error('Sessão do WhatsApp não está pronta');
      const sent = await session.client.sendMessage(chatId, text);
      const message = {
        id: sent.id.id,
        chatId,
        from: 'Você',
        text,
        date: new Date().toISOString(),
        direction: 'out',
        platform: 'whatsapp',
      };
      session.messages.unshift(message);
      return { ok: true, message };
    },
    getMessages(sessionId, chatId = null) {
      const session = sessions.get(sessionId);
      if (!session) return [];
      let msgs = session.messages;
      if (chatId) msgs = msgs.filter(m => String(m.chatId) === String(chatId));
      return msgs.slice(0, 100);
    },
    getChats(sessionId) {
      const session = sessions.get(sessionId);
      if (!session) return [];
      const chats = {};
      session.messages.forEach(m => {
        if (!chats[m.chatId]) {
          chats[m.chatId] = { chatId: m.chatId, name: m.from, platform: 'whatsapp', lastMessage: m.text, lastDate: m.date, unread: 0 };
        }
        if (m.direction === 'in') chats[m.chatId].unread += 1;
        chats[m.chatId].lastMessage = m.text;
        chats[m.chatId].lastDate = m.date;
      });
      return Object.values(chats).sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));
    },
    async logout(sessionId) {
      const session = sessions.get(sessionId);
      if (session && session.client) {
        await session.client.destroy();
      }
      sessions.delete(sessionId);
      return { ok: true };
    },
  };
}
