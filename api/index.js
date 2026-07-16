import express from 'express';
import { generatePixQrCode } from '../server/pixGateway.js';
import * as generic from '../server/genericGateway.js';
import gatewayConfigs from '../server/gatewayRegistry.js';

const app = express();
app.use(express.json({ limit: '10mb' }));

// ========================
// Webhook universal para todos os gateways
// ========================
app.post('/api/gateway/webhook/:gateway', async (req, res) => {
  try {
    const { gateway } = req.params;
    const payload = req.body;
    console.log(`[Webhook ${gateway}]`, JSON.stringify(payload).slice(0, 200));
    res.json({ ok: true });
  } catch (error) {
    console.error(`Webhook error:`, error.message);
    res.json({ ok: false });
  }
});

// ========================
// Stripe Webhook
// ========================
app.post('/api/gateway/webhook/stripe', async (req, res) => {
  try {
    console.log('[Stripe webhook]', JSON.stringify(req.body).slice(0, 200));
    res.json({ ok: true });
  } catch (error) {
    console.error('Stripe webhook error:', error.message);
    res.json({ ok: false });
  }
});

// ========================
// Check charge universal
// ========================
app.post('/api/gateway/check/:gateway', async (req, res) => {
  try {
    const { gateway } = req.params;
    const { chargeId, ...credentials } = req.body;
    if (!chargeId) return res.status(400).json({ ok: false, error: 'chargeId obrigatório' });

    const gwConfig = gatewayConfigs[gateway];
    if (!gwConfig) return res.status(400).json({ ok: false, error: `Gateway "${gateway}" não encontrado` });

    const result = await generic.checkCharge(gwConfig, credentials, chargeId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

// ========================
// Balance de gateways
// ========================
app.post('/api/gateway/balance/:gateway', async (req, res) => {
  try {
    const { gateway } = req.params;
    const credentials = req.body;

    const gwConfig = gatewayConfigs[gateway];
    if (!gwConfig) return res.status(400).json({ ok: false, error: `Gateway "${gateway}" não encontrado` });

    if (gwConfig.balanceEndpoint) {
      const headers = {
        'Accept': 'application/json',
        ...(await generic.getAuthHeader(gwConfig, credentials)),
      };
      const url = `${gwConfig.baseUrl}${gwConfig.balanceEndpoint}`;
      const resp = await fetch(url, { headers });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const balance = gwConfig.balanceMapping
        ? generic.pathGet(data, gwConfig.balanceMapping)
        : data.balance || data.amount || data.total || null;
      return res.json({ ok: true, balance: Number(balance) || 0 });
    }

    res.json({ ok: false, error: 'Balance não suportado para este gateway' });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

// ========================
// Generate PIX
// ========================
app.post('/api/gateway/generate-pix', async (req, res) => {
  try {
    const { pixKey, merchantName, amount, description, txId } = req.body;
    const result = await generatePixQrCode(pixKey || 'hive@pix.com', amount, merchantName || 'Hive', description, txId);
    res.json({ ok: true, ...result });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

// ========================
// Healthcheck
// ========================
app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

export default app;
