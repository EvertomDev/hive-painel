import { telegramRequest, setCorsHeaders } from '../lib/telegramApi.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { token } = req.body || {};
  if (!token) return res.status(400).json({ ok: false, error: 'Token é obrigatório' });

  // No serverless não mantemos polling; retornamos updates recentes uma vez
  const data = await telegramRequest(token, 'getUpdates', { limit: 50 });
  if (!data.ok) return res.status(400).json(data);

  const messages = (data.result || []).map(u => u.message).filter(Boolean).map(m => ({
    id: m.message_id,
    chatId: m.chat.id,
    from: m.from?.username || m.from?.first_name || 'Usuário',
    text: m.text || '[mídia]',
    date: new Date(m.date * 1000).toISOString(),
    direction: 'in',
    platform: 'telegram',
  })).reverse();

  return res.status(200).json({ ok: true, messages });
}
