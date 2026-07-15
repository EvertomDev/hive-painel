import fetch from 'node-fetch';

const TELEGRAM_API = 'https://api.telegram.org';

export async function telegramRequest(token, method, body = {}) {
  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return { ok: data.ok, result: data.result, error: data.description };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
