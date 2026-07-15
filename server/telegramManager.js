import TelegramBot from 'node-telegram-bot-api';

const sessions = new Map();

export function getTelegramManager() {
  return {
    sessions,
    async validateToken(token) {
      const bot = new TelegramBot(token, { polling: false });
      const me = await bot.getMe();
      return { ok: true, result: me };
    },
    startBot(token, onMessage) {
      if (sessions.has(token)) {
        const existing = sessions.get(token);
        return { ok: true, info: existing.info };
      }
      const bot = new TelegramBot(token, { polling: true });
      const session = { bot, info: null, messages: [], token };
      sessions.set(token, session);

      bot.getMe().then(me => {
        session.info = me;
      }).catch(() => {});

      bot.on('message', (msg) => {
        const message = {
          id: msg.message_id,
          chatId: msg.chat.id,
          from: msg.from?.username || msg.from?.first_name || 'Usuário',
          text: msg.text || '[mídia]',
          date: new Date(msg.date * 1000).toISOString(),
          direction: 'in',
          platform: 'telegram',
        };
        session.messages.unshift(message);
        if (session.messages.length > 200) session.messages.pop();
        if (onMessage) onMessage(token, message);
      });

      return { ok: true, info: session.info };
    },
    async sendMessage(token, chatId, text) {
      const session = sessions.get(token);
      if (!session) throw new Error('Bot não iniciado');
      const sent = await session.bot.sendMessage(chatId, text);
      const message = {
        id: sent.message_id,
        chatId: sent.chat.id,
        from: session.info?.username || 'Você',
        text,
        date: new Date().toISOString(),
        direction: 'out',
        platform: 'telegram',
      };
      session.messages.unshift(message);
      return { ok: true, message };
    },
    getMessages(token, chatId = null) {
      const session = sessions.get(token);
      if (!session) return [];
      let msgs = session.messages;
      if (chatId) msgs = msgs.filter(m => String(m.chatId) === String(chatId));
      return msgs.slice(0, 100);
    },
    getChats(token) {
      const session = sessions.get(token);
      if (!session) return [];
      const chats = {};
      session.messages.forEach(m => {
        if (!chats[m.chatId]) {
          chats[m.chatId] = {
            chatId: m.chatId,
            name: m.from,
            platform: 'telegram',
            lastMessage: m.text,
            lastDate: m.date,
            unread: 0,
          };
        }
        if (m.direction === 'in') chats[m.chatId].unread += 1;
        chats[m.chatId].lastMessage = m.text;
        chats[m.chatId].lastDate = m.date;
      });
      return Object.values(chats).sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));
    },
  };
}
