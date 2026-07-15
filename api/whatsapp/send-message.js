export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  return res.status(503).json({
    ok: false,
    error: 'WhatsApp requer um servidor Node.js contínuo (não funciona em serverless). Rode o projeto localmente com "node server.js" ou hospede em um VPS/Railway/Render.',
  });
}
