import { telegramRequest, setCorsHeaders } from '../lib/telegramApi.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { token } = req.body || {};
  if (!token) return res.status(400).json({ ok: false, error: 'Token é obrigatório' });

  const data = await telegramRequest(token, 'getUpdates', { limit: 100 });
  if (!data.ok) return res.status(400).json(data);

  const chats = {};
  (data.result || []).map(u => u.message).filter(Boolean).forEach(m => {
    const chatId = m.chat.id;
    const from = m.from?.username || m.from?.first_name || 'Usuário';
    const text = m.text || '[mídia]';
    const date = new Date(m.date * 1000).toISOString();
    if (!chats[chatId]) {
      chats[chatId] = { chatId, name: from, platform: 'telegram', lastMessage: text, lastDate: date, unread: 0 };
    }
    chats[chatId].lastMessage = text;
    chats[chatId].lastDate = date;
    chats[chatId].unread += 1;
  });

  return res.status(200).json({ ok: true, chats: Object.values(chats).sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate)) });
}
