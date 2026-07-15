import { telegramRequest, setCorsHeaders } from '../lib/telegram.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { token } = req.body || {};
  if (!token) return res.status(400).json({ ok: false, error: 'Token é obrigatório' });

  const data = await telegramRequest(token, 'getMe');
  return res.status(data.ok ? 200 : 400).json(data);
}
