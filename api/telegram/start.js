import { telegramRequest, setCorsHeaders } from '../lib/telegramApi.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { token } = req.body || {};
  if (!token) return res.status(400).json({ ok: false, error: 'Token é obrigatório' });

  const data = await telegramRequest(token, 'getMe');
  return res.status(data.ok ? 200 : 400).json({ ok: data.ok, info: data.result, error: data.error, note: 'Modo serverless: use a aba Mensagens para buscar atualizações.' });
}
