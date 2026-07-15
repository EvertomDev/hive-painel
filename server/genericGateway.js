const fetch = globalThis.fetch;

// ─── Auth helpers ───────────────────────────────────────────
async function authBearer(baseUrl, credentials) {
  const { token } = credentials;
  return token ? { token, type: 'Bearer' } : null;
}

async function authBasic(baseUrl, credentials) {
  const { apiKey, secretKey, clientId, clientSecret } = credentials;
  const user = apiKey || clientId || '';
  const pass = secretKey || clientSecret || '';
  if (!user || !pass) return null;
  return { token: Buffer.from(`${user}:${pass}`).toString('base64'), type: 'Basic' };
}

async function authOAuth2(baseUrl, credentials, tokenUrl) {
  const { clientId, clientSecret } = credentials;
  if (!clientId || !clientSecret) return null;
  const url = tokenUrl ? `${baseUrl}${tokenUrl}` : `${baseUrl}/oauth/token`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: 'client_credentials' }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { token: data.access_token || data.token || data.data?.token, type: 'Bearer' };
  } catch { return null; }
}

async function authApiKey(baseUrl, credentials) {
  const { apiKey, token } = credentials;
  return apiKey || token ? { token: apiKey || token, type: 'ApiKey' } : null;
}

const AUTH_METHODS = {
  bearer: authBearer,
  basic: authBasic,
  oauth2: (baseUrl, creds) => authOAuth2(baseUrl, creds),
  apikey: authApiKey,
};

async function getAuthHeader(config, credentials) {
  const authFn = AUTH_METHODS[config.auth];
  if (!authFn) return {};
  const tokenUrl = config.authTokenUrl;
  const result = config.auth === 'oauth2'
    ? await authOAuth2(config.baseUrl, credentials, tokenUrl)
    : await authFn(config.baseUrl, credentials);
  if (!result) return {};
  if (result.type === 'ApiKey') {
    const keyName = config.apiKeyHeader || 'x-api-key';
    return { [keyName]: result.token };
  }
  return { 'Authorization': `${result.type} ${result.token}` };
}

// ─── Build request body ────────────────────────────────────
function buildBody(config, params) {
  if (!config.bodyTemplate) {
    const val = config.amountUnit === 'cents' ? Math.round(params.amount * 100) : parseFloat(params.amount.toFixed(2));
    return JSON.stringify({ value: val, amount: val, description: params.description });
  }

  if (typeof config.bodyTemplate === 'function') {
    const body = config.bodyTemplate(params);
    if (body._raw) {
      return { raw: body._raw, contentType: body._contentType || 'application/json' };
    }
    return { raw: JSON.stringify(body), contentType: 'application/json' };
  }

  return { raw: JSON.stringify(config.bodyTemplate), contentType: 'application/json' };
}

// ─── Create PIX charge ─────────────────────────────────────
async function createPixCharge(gatewayConfig, credentials, { amount, description, customerName, customerEmail, externalId, webhookUrl, pixKey }) {
  try {
    const headers = {
      'Accept': 'application/json',
      ...(await getAuthHeader(gatewayConfig, credentials)),
    };

    const { raw: bodyRaw, contentType } = buildBody(gatewayConfig, { amount, description, customerName, customerEmail, externalId, webhookUrl, pixKey, credentials });
    headers['Content-Type'] = contentType;

    const url = `${gatewayConfig.baseUrl}${gatewayConfig.endpoints.createCharge}`;
    const res = await fetch(url, {
      method: gatewayConfig.createMethod || 'POST',
      headers,
      body: bodyRaw,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const mapping = gatewayConfig.responseMapping || {};

    const paymentId = mapping.paymentId
      ? pathGet(data, mapping.paymentId) || data.id || data.idTransaction || data.data?.id
      : data.id || data.idTransaction || data.payment_id || data.charge_id || data.txid || data.data?.id || externalId;

    let qrCodeDataUrl = mapping.qrCodeDataUrl ? pathGet(data, mapping.qrCodeDataUrl) : null;
    if (!qrCodeDataUrl) {
      const raw = data.qr_code_base64 || data.paymentCodeBase64 || data.data?.qr_code_base64 || data.data?.paymentCodeBase64 || '';
      qrCodeDataUrl = raw.startsWith('data:') ? raw : raw ? `data:image/png;base64,${raw}` : data.qr_code_url || data.qrcodeUrl || null;
    }

    let qrCodeText = mapping.qrCodeText ? pathGet(data, mapping.qrCodeText) : null;
    if (!qrCodeText) {
      qrCodeText = data.qr_code || data.pix_code || data.paymentCode || data.pixCopiaECola || data.copyPaste || data.data?.pixCopiaECola || data.br_code || null;
    }

    return {
      ok: true,
      paymentId: String(paymentId || ''),
      qrCodeDataUrl: qrCodeDataUrl || null,
      qrCodeText: qrCodeText || null,
      pixKey: mapping.pixKey ? pathGet(data, mapping.pixKey) : data.pix_key || null,
      status: mapping.status ? normalizeStatus(pathGet(data, mapping.status)) : normalizeStatus(data.status || data.status_transaction || 'pending'),
      total: amount,
      gateway: gatewayConfig.name,
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ─── Check charge status ───────────────────────────────────
async function checkCharge(gatewayConfig, credentials, chargeId) {
  try {
    const headers = {
      'Accept': 'application/json',
      ...(await getAuthHeader(gatewayConfig, credentials)),
    };

    let checkPath = gatewayConfig.endpoints.checkCharge || '/transaction/{id}';
    let url = `${gatewayConfig.baseUrl}${checkPath}`.replace('{id}', chargeId);

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const status = data.status || data.status_transaction || data.data?.status || 'pending';
    return {
      ok: true,
      status: normalizeStatus(status),
      paidAt: data.paid_at || data.paidAt || data.payment_date || data.data?.paidAt || null,
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ─── Helpers ────────────────────────────────────────────────
function pathGet(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

function normalizeStatus(status) {
  if (!status) return 'pending';
  const s = String(status).toLowerCase();
  if (['paid', 'approved', 'completed', 'concluida', 'succeeded', 'confirmed', 'success', 'finished', 'pago', 'ativa'].includes(s)) return 'approved';
  if (['created', 'pending', 'processing', 'waiting', 'ativa', 'waiting_for_approval', 'started', 'active', 'pendente', 'gerado'].includes(s)) return 'pending';
  if (['expired', 'expirou', 'cancelled', 'canceled', 'failed', 'refunded', 'removida_pelo_usuario_recebedor', 'recusado', 'falhou', 'chargeback'].includes(s)) return s;
  return s;
}

export { createPixCharge, checkCharge, normalizeStatus };
