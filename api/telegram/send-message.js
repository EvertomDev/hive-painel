import { telegramRequest, setCorsHeaders } from '../lib/telegramApi.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { token, chatId, text } = req.body || {};
  if (!token || !chatId || !text) return res.status(400).json({ ok: false, error: 'Token, chatId e text são obrigatórios' });

  const data = await telegramRequest(token, 'sendMessage', { chat_id: chatId, text });
  return res.status(data.ok ? 200 : 400).json(data);
}
