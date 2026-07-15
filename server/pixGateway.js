const QRCode = require('qrcode');

function generatePixBRCode(pixKey, merchantName, merchantCity, amount, description, txId) {
  const merchantAccountInfo = `0014BR.GOV.BCB.PIX0136${pixKey}`;
  const merchantNamePadded = (merchantName || 'Zeze').substring(0, 25).padEnd(25, ' ');
  const merchantCityPadded = (merchantCity || 'Brasil').substring(0, 15).padEnd(15, ' ');
  const txIdFormatted = (txId || '***').substring(0, 25);

  let payload = '000201';
  payload += '010212'; // Merchant Account Information (GUI)
  
  // Merchant Account Information
  const maiValue = merchantAccountInfo;
  payload += `26${String(maiValue.length).padStart(2, '0')}${maiValue}`;
  
  // Merchant Category Code
  payload += '52040000';
  
  // Transaction Currency (986 = BRL)
  payload += '5303986';
  
  // Transaction Amount
  const amountStr = amount.toFixed(2);
  payload += `54${String(amountStr.length).padStart(2, '0')}${amountStr}`;
  
  // Country Code
  payload += '5802BR';
  
  // Merchant Name
  payload += `59${String(merchantNamePadded.length).padStart(2, '0')}${merchantNamePadded}`;
  
  // Merchant City
  payload += `60${String(merchantCityPadded.length).padStart(2, '0')}${merchantCityPadded}`;
  
  // Additional Data Field (TXID)
  payload += `62${String(String(txIdFormatted.length + 2).padStart(2, '0') + txIdFormatted).length}05${String(txIdFormatted.length).padStart(2, '0')}${txIdFormatted}`;
  
  // CRC16
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
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

async function generatePixQrCode(pixKey, amount, merchantName, description, txId) {
  const brCode = generatePixBRCode(pixKey, merchantName, 'Brasil', amount, description, txId);
  const qrCodeDataUrl = await QRCode.toDataURL(brCode, {
    width: 400,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' }
  });
  return { brCode, qrCodeDataUrl };
}

async function createPixPayment(config, paymentData) {
  const { productName, productPrice, customerName, paymentId } = paymentData;
  const { pixKey, merchantName, gateway, gateways } = config;

  const pixKeyToUse = pixKey || 'zeze@pix.com';
  const merchantNameToUse = merchantName || 'Zeze Content';

  // Try configured gateway (Mercado Pago, GerenciaNet, etc.)
  if (gateway === 'mercado_pago' && gateways?.mercadoPago?.token) {
    try {
      const mp = gateways.mercadoPago;
      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mp.token}`
        },
        body: JSON.stringify({
          transaction_amount: productPrice,
          description: `${productName} - ${paymentId}`,
          payment_method_id: 'pix',
          payer: { email: mp.email || 'cliente@email.com', first_name: customerName || 'Cliente' }
        })
      });
      const data = await response.json();
      if (data.point_of_interaction?.transaction_data) {
        const tx = data.point_of_interaction.transaction_data;
        return {
          status: 'pending',
          qrCodeDataUrl: tx.qr_code_base64 ? `data:image/gif;base64,${tx.qr_code_base64}` : null,
          qrCodeText: tx.qr_code,
          pixKey: null,
          total: productPrice,
          expiresAt: data.date_of_expiration,
          paymentId: data.id,
          gateway: 'mercado_pago',
          instructions: `💳 PIX Mercado Pago\n\nValor: R$ ${productPrice.toFixed(2)}\nEscaneie o QR Code ou copie o código PIX abaixo.`
        };
      }
    } catch (e) {
      console.error('Mercado Pago error:', e.message);
    }
  }

  // Fallback: static PIX QR Code
  const pixResult = await generatePixQrCode(pixKeyToUse, productPrice, merchantNameToUse, productName, paymentId);
  return {
    status: 'pending',
    qrCodeDataUrl: pixResult.qrCodeDataUrl,
    qrCodeText: pixResult.brCode,
    pixKey: pixKeyToUse,
    total: productPrice,
    paymentId,
    gateway: 'static',
    instructions: `💳 PIX\n\nValor: R$ ${productPrice.toFixed(2)}\n\n📱 Escaneie o QR Code abaixo\nou copie o código PIX.`
  };
}

module.exports = { generatePixBRCode, generatePixQrCode, createPixPayment, crc16 };
