import TelegramBot from 'node-telegram-bot-api';
import { createPixPayment } from './pixGateway.js';

const activeBots = new Map();
const pendingPayments = new Map();
const paymentConfirmations = new Map();

function formatMoney(value) {
  return 'R$ ' + Number(value).toFixed(2).replace('.', ',');
}

function getGroupsCatalogMessage(groups, botName) {
  if (!groups || groups.length === 0) {
    return `📦 *Catálogo - ${botName}*\n\nNenhum grupo disponível no momento.`;
  }

  let msg = `🔞 *${botName} - Acesso Exclusivo*\n\n` +
    `Escolha um grupo para entrar 👇\n\n` +
    `─ • ✦ ✦ • ─────────────────\n`;

  groups.forEach((g, i) => {
    msg += `\n${i + 1}. *${g.name}* ${g.preview || ''}\n`;
    msg += `   📝 ${g.description || 'Grupo exclusivo com conteúdo premium'}\n`;
    msg += `   👥 ${g.members || 0} membros\n`;
    msg += `   💰 *${formatMoney(g.price)}* — acesso vitalício\n`;
    msg += `   🔹 /comprar_${g.id}\n`;
  });

  msg += `\n─ • ✦ ✦ • ─────────────────\n\n` +
    `💡 Use /comprar_ID para adquirir acesso.\n` +
    `📞 /suporte — Dúvidas?\n\n` +
    `✨ *Zeze GroupSeller*`;

  return msg;
}

async function startBot(botConfig, options = {}) {
  const { name, token, id, groups = [], pixConfig, welcomeMessage } = botConfig;
  const { onOrder, onPaymentConfirm, onContact, getGroups } = options;

  if (activeBots.has(id)) {
    try { await activeBots.get(id).bot.stop(); } catch (e) {}
    activeBots.delete(id);
  }

  let bot;
  try {
    bot = new TelegramBot(token, { polling: true, request: { url: undefined } });
  } catch (e) {
    return { ok: false, error: e.message };
  }

  const botState = { bot, waitingContact: new Map(), waitingSupport: new Map() };
  activeBots.set(id, botState);

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'Cliente';

    let welcome = `🔞 *Bem-vindo(a), ${firstName}!*\n\n` +
      `Você está no *${name}* — acesso vip a grupos exclusivos.🔥\n\n` +
      `📌 *Grupos disponíveis:*\n` +
      `📦 /catalogo — Ver todos os grupos\n` +
      `💳 /comprar — Como comprar acesso\n` +
      `❓ /ajuda — Dúvidas frequentes\n` +
      `📞 /suporte — Falar com atendente\n` +
      `🔞 +18 — Conteúdo adulto`;

    if (welcomeMessage) {
      welcome = welcomeMessage + `\n\n📦 /catalogo\n💳 /comprar\n📞 /suporte`;
    }

    await bot.sendMessage(chatId, welcome, { parse_mode: 'Markdown' });
  });

  bot.onText(/\/catalogo/, async (msg) => {
    const chatId = msg.chat.id;
    const allGroups = typeof getGroups === 'function' ? getGroups() : groups;
    await bot.sendMessage(chatId, getGroupsCatalogMessage(allGroups, name), { parse_mode: 'Markdown' });
  });

  bot.onText(/\/comprar/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId,
      `💳 *Como Comprar Acesso*\n\n` +
      `1️⃣ Escolha um grupo no /catalogo\n` +
      `2️⃣ Use /comprar_ID (ex: /comprar_grupo123)\n` +
      `3️⃣ Faça o PIX com QR Code\n` +
      `4️⃣ Envie o *comprovante* aqui\n` +
      `5️⃣ Receba o link do grupo! 🎉\n\n` +
      `🔒 *100% discreto e seguro*`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.onText(/\/comprar_(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const groupId = match[1];
    const allGroups = typeof getGroups === 'function' ? getGroups() : groups;
    const group = allGroups.find(g => g.id === groupId);

    if (!group) {
      await bot.sendMessage(chatId, '❌ Grupo não encontrado. Use /catalogo.');
      return;
    }

    const contactKey = `${chatId}_${groupId}`;
    botState.waitingContact.set(contactKey, { group, step: 'awaiting_name' });

    await bot.sendMessage(chatId,
      `🛒 *${group.name}*\n\n` +
      `📝 ${group.description}\n` +
      `👥 ${group.members || 0} membros\n` +
      `💰 *Valor:* ${formatMoney(group.price)}\n\n` +
      `Para continuar, me diga seu *nome*:`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.onText(/\/suporte/, async (msg) => {
    const chatId = msg.chat.id;
    botState.waitingSupport.set(chatId, true);
    await bot.sendMessage(chatId,
      `📞 *Suporte*\n\n` +
      `Digite sua mensagem abaixo. Responderemos em breve!\n\n` +
      `Ou fale direto: @zeze_suporte`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.onText(/\/ajuda/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId,
      `❓ *Dúvidas*\n\n` +
      `🔹 *Como acesso o grupo?*\n` +
      `Após confirmar o pagamento, enviamos o link automaticamente.\n\n` +
      `🔹 *Quanto tempo dura?*\n` +
      `Acesso vitalício ao grupo.\n\n` +
      `🔹 *É anônimo?*\n` +
      `Sim! 100% discreto.\n\n` +
      `🔹 *Perdi o link?*\n` +
      `Use /meupedido para reenviar.`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.onText(/\/meupedido/, async (msg) => {
    const chatId = msg.chat.id;
    const conf = paymentConfirmations.get(String(chatId));
    if (conf && conf.groupLink) {
      await bot.sendMessage(chatId,
        `🔗 *Seu Link de Acesso:*\n\n` +
        `${conf.groupLink}\n\n` +
        `👥 Clique no link para entrar no grupo!`,
        { parse_mode: 'Markdown' }
      );
    } else {
      await bot.sendMessage(chatId, '❌ Nenhum pedido confirmado encontrado. Use /catalogo para comprar.');
    }
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (!msg.text || msg.text.startsWith('/')) {
      if ((msg.photo || msg.document) && !msg.text?.startsWith('/')) {
        // Payment proof received
        const conf = paymentConfirmations.get(String(chatId));
        if (conf && conf.status === 'pending') {
          conf.status = 'proof_sent';
          if (typeof onPaymentConfirm === 'function') {
            onPaymentConfirm({
              chatId: String(chatId),
              name: msg.from.first_name,
              username: msg.from.username,
              groupId: conf.groupId,
              groupName: conf.groupName,
              value: conf.value,
              botId: id,
              botName: name,
            });
          }

          await bot.sendMessage(chatId,
            `✅ *Comprovante Recebido!*\n\n` +
            `Estamos verificando seu pagamento.\n` +
            `Assim que confirmarmos, enviaremos o link do grupo! 🎉\n\n` +
            `💰 /meupedido — Ver status`,
            { parse_mode: 'Markdown' }
          );
          return;
        }
      }
      return;
    }

    // Check if waiting for contact info
    for (const [key, data] of botState.waitingContact) {
      if (key.startsWith(String(chatId))) {
        if (data.step === 'awaiting_name') {
          data.customerName = msg.text;
          data.step = 'awaiting_contact';
          await bot.sendMessage(chatId, '📱 Agora informe seu *WhatsApp* ou @username do Telegram:', { parse_mode: 'Markdown' });
          return;
        } else if (data.step === 'awaiting_contact') {
          data.customerContact = msg.text;
          data.step = 'completed';

          const pixCfg = pixConfig || { pixKey: 'zeze@pix.com', merchantName: 'Zeze' };
          const paymentId = 'PIX-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();

          let payment;
          try {
            payment = await createPixPayment(pixCfg, {
              productName: data.group.name,
              productPrice: data.group.price,
              customerName: data.customerName,
              paymentId,
            });
          } catch (e) {
            payment = {
              status: 'pending',
              qrCodeText: 'Falha ao gerar QR Code',
              pixKey: pixCfg.pixKey || 'zeze@pix.com',
              total: data.group.price,
              paymentId,
              gateway: 'static',
              instructions: `💳 PIX\n\nValor: ${formatMoney(data.group.price)}\nChave: ${pixCfg.pixKey || 'zeze@pix.com'}`
            };
          }

          const orderData = {
            botId: id,
            botName: name,
            groupId: data.group.id,
            groupName: data.group.name,
            value: data.group.price,
            customerName: data.customerName,
            customerContact: data.customerContact,
            chatId: String(chatId),
            status: 'pending',
            paymentId,
            createdAt: new Date().toISOString(),
          };

          if (typeof onOrder === 'function') {
            onOrder(orderData);
          }

          paymentConfirmations.set(String(chatId), {
            groupId: data.group.id,
            groupName: data.group.name,
            value: data.group.price,
            status: 'pending',
            groupLink: data.group.inviteLink,
          });

          let msgText = `✅ *Pedido Registrado!*\n\n` +
            `Grupo: ${data.group.name}\n` +
            `Valor: ${formatMoney(data.group.price)}\n\n`;

          if (payment.qrCodeDataUrl) {
            await bot.sendPhoto(chatId, payment.qrCodeDataUrl, {
              caption: `📱 *Escaneie o QR Code* para pagar\n\nValor: ${formatMoney(data.group.price)}`,
              parse_mode: 'Markdown'
            });
            msgText += `💳 *Ou copie o código PIX abaixo:*\n\`${payment.qrCodeText}\`\n\n`;
          } else {
            msgText += `${payment.instructions}\n\n`;
          }

          msgText += `📌 *Após pagar, envie o comprovante aqui.*`;

          await bot.sendMessage(chatId, msgText, { parse_mode: 'Markdown' });

          botState.waitingContact.delete(key);
          return;
        }
      }
    }

    if (botState.waitingSupport.has(chatId)) {
      await bot.sendMessage(chatId, '📩 Mensagem recebida! Responderemos em breve.');
      botState.waitingSupport.delete(chatId);
      if (typeof onContact === 'function') {
        onContact({ chatId, name: msg.from.first_name, username: msg.from.username, message: msg.text, botId: id, botName: name });
      }
      return;
    }
  });

  bot.on('polling_error', (err) => {
    console.error(`[Bot ${name}] Polling error:`, err.message);
  });

  return { ok: true, bot, info: { id, name } };
}

function stopBot(botId) {
  const state = activeBots.get(botId);
  if (state) {
    try { state.bot.stop(); } catch (e) {}
    activeBots.delete(botId);
    return true;
  }
  return false;
}

function getActiveBots() {
  const result = {};
  for (const [id, state] of activeBots) {
    result[id] = { running: true };
  }
  return result;
}

async function sendGroupLink(botId, chatId, inviteLink) {
  const state = activeBots.get(botId);
  if (!state) return { ok: false, error: 'Bot não está rodando' };
  try {
    await state.bot.sendMessage(chatId,
      `🎉 *Pagamento Confirmado!*\n\n` +
      `✅ Seu acesso ao grupo foi liberado!\n\n` +
      `👇 *Clique no link para entrar:*\n` +
      `${inviteLink}\n\n` +
      `🔥 Bem-vindo(a) ao clube VIP!`,
      { parse_mode: 'Markdown', disable_web_page_preview: true }
    );
    paymentConfirmations.set(String(chatId), { groupId: null, groupName: null, value: null, status: 'confirmed', groupLink: inviteLink });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function sendMessageToChat(botId, chatId, text) {
  const state = activeBots.get(botId);
  if (!state) return { ok: false, error: 'Bot não está rodando' };
  try {
    await state.bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export { startBot, stopBot, getActiveBots, sendGroupLink, sendMessageToChat, formatMoney };
