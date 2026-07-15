import fs from 'fs';
import pkg from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { HttpsProxyAgent } from 'https-proxy-agent';

const { Client, LocalAuth } = pkg;

const sessions = new Map();

function createPuppeteerConfig() {
  const isProd = process.env.NODE_ENV === 'production';
  const headless = process.env.PUPPETEER_HEADLESS === 'false' ? false : (isProd ? true : 'new');

  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-blink-features=AutomationControlled',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-component-extensions-with-background-pages',
    '--ignore-certificate-errors',
    '--ignore-ssl-errors',
    '--lang=en-US,en;q=0.9',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-sync',
    '--disable-translate',
    '--disable-hang-monitor',
    '--disable-prompt-on-repost',
    '--disable-client-side-phishing-detection',
    '--disable-crash-reporter',
    '--disable-ipc-flooding-protection',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
  ];

  if (process.env.PROXY_URL) {
    args.push(`--proxy-server=${process.env.PROXY_URL}`);
  }

  return {
    headless,
    args,
    defaultViewport: null,
  };
}

function logError(context, err) {
  console.error(`[WhatsApp][${context}]`, {
    message: err?.message || err,
    stack: err?.stack?.split('\n').slice(0, 3).join('\n'),
    timestamp: new Date().toISOString(),
  });
}

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

        const puppeteerConfig = createPuppeteerConfig();

        const client = new Client({
          authStrategy: new LocalAuth({ dataPath: `./data/whatsapp-${sessionId}` }),
          puppeteer: {
            ...puppeteerConfig,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
          },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        });
        session.client = client;

        client.on('qr', async (qr) => {
          session.qr = await QRCode.toDataURL(qr);
          session.status = 'qr';

          try {
            const qrDir = './data/qr-codes';
            if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });
            fs.writeFileSync(`${qrDir}/${sessionId}.html`, `<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;background:#111"><img src="${session.qr}" /></body></html>`);
          } catch (e) {
            logError('qr-save', e);
          }

          if (callbacks.onQr) callbacks.onQr(sessionId, session.qr);
          resolve({ ok: true, status: 'qr', qr: session.qr });
        });

        client.on('ready', () => {
          console.log(`[WhatsApp][${sessionId}] Sessão pronta!`);
          session.ready = true;
          session.status = 'ready';
          session.info = { name: 'WhatsApp Session' };
          if (callbacks.onReady) callbacks.onReady(sessionId);
        });

        client.on('authenticated', () => {
          console.log(`[WhatsApp][${sessionId}] Autenticado com sucesso`);
          session.status = 'authenticated';
        });

        client.on('auth_failure', (msg) => {
          console.error(`[WhatsApp][${sessionId}] Falha na autenticação:`, msg);
          session.status = 'auth_failure';
          sessions.delete(sessionId);
          if (callbacks.onError) callbacks.onError(sessionId, msg);
        });

        client.on('disconnected', (reason) => {
          console.warn(`[WhatsApp][${sessionId}] Desconectado:`, reason);
          sessions.delete(sessionId);
          if (callbacks.onDisconnect) callbacks.onDisconnect(sessionId, reason);
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
          } catch (e) {
            logError('message_create', e);
          }
        });

        client.initialize().catch(err => {
          logError('initialize', err);
          sessions.delete(sessionId);
          resolve({ ok: false, error: err.message });
        });

        const timeout = parseInt(process.env.WHATSAPP_TIMEOUT || '30000', 10);
        setTimeout(() => {
          if (session.status === 'connecting') {
            console.warn(`[WhatsApp][${sessionId}] Timeout de conexão (${timeout}ms)`);
            resolve({ ok: true, status: 'connecting', qr: session.qr });
          }
        }, timeout);
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
