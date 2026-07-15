import QRCode from 'qrcode';
import * as generic from './genericGateway.js';
import gatewayConfigs from './gatewayRegistry.js';

function generatePixBRCode(pixKey, merchantName, merchantCity, amount, description, txId) {
  const merchantAccountInfo = `0014BR.GOV.BCB.PIX0136${pixKey}`;
  const merchantNamePadded = (merchantName || 'Zeze').substring(0, 25).padEnd(25, ' ');
  const merchantCityPadded = (merchantCity || 'Brasil').substring(0, 15).padEnd(15, ' ');
  const txIdFormatted = (txId || '***').substring(0, 25);

  let payload = '000201';
  payload += '010212';
  const maiValue = merchantAccountInfo;
  payload += `26${String(maiValue.length).padStart(2, '0')}${maiValue}`;
  payload += '52040000';
  payload += '5303986';
  const amountStr = amount.toFixed(2);
  payload += `54${String(amountStr.length).padStart(2, '0')}${amountStr}`;
  payload += '5802BR';
  payload += `59${String(merchantNamePadded.length).padStart(2, '0')}${merchantNamePadded}`;
  payload += `60${String(merchantCityPadded.length).padStart(2, '0')}${merchantCityPadded}`;
  payload += `62${String(String(txIdFormatted.length + 2).padStart(2, '0') + txIdFormatted).length}05${String(txIdFormatted.length).padStart(2, '0')}${txIdFormatted}`;
  payload += '6304';
  const crc = crc16(payload);
  payload += crc;
  return payload;
}

function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
      else crc = crc << 1;
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

async function generatePixQrCode(pixKey, amount, merchantName, description, txId) {
  const brCode = generatePixBRCode(pixKey, merchantName, 'Brasil', amount, description, txId);
  const qrCodeDataUrl = await QRCode.toDataURL(brCode, {
    width: 400, margin: 2,
    color: { dark: '#000000', light: '#ffffff' }
  });
  return { brCode, qrCodeDataUrl };
}

// ─── Main: try all gateways ─────────────────────────────────
async function createPixPayment(config, paymentData) {
  const { productName, productPrice, customerName, paymentId } = paymentData;
  const { pixKey, merchantName, gateway, gateways } = config;

  const pixKeyToUse = pixKey || 'zeze@pix.com';
  const merchantNameToUse = merchantName || 'Zeze Content';

  if (!gateway || gateway === 'static') {
    return staticPix(pixKeyToUse, merchantNameToUse, productPrice, productName, paymentId);
  }

  const gatewayKey = gateway.replace(/_/g, '').toLowerCase();
  const gwConfig = gatewayConfigs[gatewayKey];
  const gwCredentials = gateways?.[gatewayKey] || {};

  if (gwConfig && hasCredentials(gwConfig, gwCredentials)) {
    try {
      const result = await generic.createPixCharge(gwConfig, gwCredentials, {
        amount: productPrice,
        description: `${productName} - ${paymentId}`,
        customerName: customerName || 'Cliente',
        customerEmail: gwCredentials.email || 'cliente@email.com',
        externalId: paymentId,
        webhookUrl: gwCredentials.webhookUrl || null,
        pixKey: pixKeyToUse,
      });
      if (result.ok) {
        return {
          ...result,
          instructions: `💳 PIX ${gwConfig.name}\n\nValor: R$ ${productPrice.toFixed(2)}\nEscaneie o QR Code ou copie o código PIX abaixo.`,
        };
      }
      console.error(`${gwConfig.name} error:`, result.error);
    } catch (e) {
      console.error(`${gwConfig.name} error:`, e.message);
    }
  }

  return staticPix(pixKeyToUse, merchantNameToUse, productPrice, productName, paymentId);
}

function hasCredentials(config, creds) {
  if (!config.credentials || config.credentials.length === 0) return false;
  return config.credentials.some(k => creds[k]);
}

async function staticPix(pixKey, merchantName, amount, productName, paymentId) {
  const pixResult = await generatePixQrCode(pixKey, amount, merchantName, productName, paymentId);
  return {
    status: 'pending',
    qrCodeDataUrl: pixResult.qrCodeDataUrl,
    qrCodeText: pixResult.brCode,
    pixKey,
    total: amount,
    paymentId,
    gateway: 'static',
    instructions: `💳 PIX\n\nValor: R$ ${amount.toFixed(2)}\n\n📱 Escaneie o QR Code abaixo\nou copie o código PIX.`,
  };
}

export { generatePixBRCode, generatePixQrCode, createPixPayment, crc16 };
