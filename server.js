import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/telegram/me', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ ok: false, error: 'Token não fornecido' });
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Erro ao conectar com Telegram: ' + error.message });
  }
});

app.post('/api/telegram/send-message', async (req, res) => {
  const { token, chatId, text } = req.body;
  if (!token || !chatId || !text) return res.status(400).json({ ok: false, error: 'Dados incompletos' });
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Zeze Painel rodando em http://localhost:${PORT}`);
});
