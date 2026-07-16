import TelegramBot from 'node-telegram-bot-api';
import { createPixPayment } from './pixGateway.js';

const activeBots = new Map();
const paymentConfirmations = new Map();

function formatMoney(value) {
  return 'R$ ' + Number(value).toFixed(2).replace('.', ',');
}

function mainMenu(firstName, botName) {
  return {
    text: `🌟 *Olá, ${firstName}!*\nBem-vindo ao *${botName}* 🔞\n\nAqui você encontra grupos exclusivos com conteúdo premium. Escolha uma opção abaixo:`,
    keyboard: [
      [{ text: '📦 Ver Catálogo', callback_data: 'catalogo' }],
      [{ text: '💳 Como Comprar', callback_data: 'como_comprar' }],
      [{ text: '❓ Ajuda', callback_data: 'ajuda' }, { text: '📞 Suporte', callback_data: 'suporte' }],
    ],
  };
}

function catalogMessage(groups, botName) {
  let text = `📦 *Catálogo ${botName}*\n\nConfira nossos grupos VIP 👇\n\n`;
  const keyboard = [];

  groups.forEach((g, i) => {
    text += `${i + 1}. *${g.name}* ${g.preview || ''}\n`;
    text += `   👥 ${g.members || 0} membros  |  💰 *${formatMoney(g.price)}*\n\n`;
    keyboard.push([{ text: `🛒 Comprar ${g.name} — ${formatMoney(g.price)}`, callback_data: `comprar_${g.id}` }]);
  });

  text += `\n───────────────\n✅ Pagamento 100% seguro via PIX`;
  keyboard.push([{ text: '🔙 Voltar ao Menu', callback_data: 'menu' }]);

  return { text, keyboard };
}

function comoComprarMessage() {
  return {
    text: `💳 *Como Comprar Acesso*\n\n` +
      `1️⃣ Escolha um grupo no catálogo\n` +
      `2️⃣ Clique em *Comprar* no grupo desejado\n` +
      `3️⃣ Faça o PIX via QR Code\n` +
      `4️⃣ Envie o *comprovante* aqui\n` +
      `5️⃣ Receba o link do grupo! 🎉\n\n` +
      `🔒 *100% discreto e seguro*`,
    keyboard: [[{ text: '📦 Ver Catálogo', callback_data: 'catalogo' }], [{ text: '🔙 Menu', callback_data: 'menu' }]],
  };
}

function ajudaMessage() {
  return {
    text: `❓ *Dúvidas Frequentes*\n\n` +
      `🔹 *Como acesso o grupo?*\n` +
      `Após confirmar o pagamento, enviamos o link automático.\n\n` +
      `🔹 *Quanto tempo dura?*\n` +
      `Acesso vitalício ao grupo.\n\n` +
      `🔹 *É anônimo?*\n` +
      `Sim! 100% discreto.\n\n` +
      `🔹 *Perdi o link?*\n` +
      `Clique em "Meu Pedido" no menu para reenviar.`,
    keyboard: [[{ text: '📦 Catálogo', callback_data: 'catalogo' }], [{ text: '🔙 Menu', callback_data: 'menu' }]],
  };
}

function suporteMessage() {
  return {
    text: `📞 *Suporte*\n\nDigite sua mensagem abaixo.\nResponderemos em breve!`,
    keyboard: [[{ text: '🔙 Menu', callback_data: 'menu' }]],
  };
}

function sendWithKeyboard(bot, chatId, { text, keyboard }, extra = {}) {
  return bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: keyboard },
    ...extra,
  });
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

  const getCatalog = () => {
    const allGroups = typeof getGroups === 'function' ? getGroups() : groups;
    return catalogMessage(allGroups, name);
  };

  // /start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'Cliente';

    if (welcomeMessage) {
      await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
    }

    const menu = mainMenu(firstName, name);
    await sendWithKeyboard(bot, chatId, menu);
  });

  // Callback queries (button clicks)
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    const msgId = query.message.message_id;
    const firstName = query.from.first_name || 'Cliente';

    await bot.answerCallbackQuery(query.id);

    if (data === 'menu') {
      const menu = mainMenu(firstName, name);
      await bot.editMessageText(menu.text, {
        chat_id: chatId, message_id: msgId,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: menu.keyboard },
      });
      return;
    }

    if (data === 'catalogo') {
      const cat = getCatalog();
      await bot.editMessageText(cat.text, {
        chat_id: chatId, message_id: msgId,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: cat.keyboard },
      });
      return;
    }

    if (data === 'como_comprar') {
      const c = comoComprarMessage();
      await bot.editMessageText(c.text, {
        chat_id: chatId, message_id: msgId,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: c.keyboard },
      });
      return;
    }

    if (data === 'ajuda') {
      const a = ajudaMessage();
      await bot.editMessageText(a.text, {
        chat_id: chatId, message_id: msgId,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: a.keyboard },
      });
      return;
    }

    if (data === 'suporte') {
      botState.waitingSupport.set(chatId, true);
      const s = suporteMessage();
      await bot.editMessageText(s.text, {
        chat_id: chatId, message_id: msgId,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: s.keyboard },
      });
      return;
    }

    if (data.startsWith('comprar_')) {
      const groupId = data.replace('comprar_', '');
      const allGroups = typeof getGroups === 'function' ? getGroups() : groups;
      const group = allGroups.find(g => g.id === groupId);

      if (!group) {
        await bot.sendMessage(chatId, '❌ Grupo não encontrado.');
        return;
      }

      const contactKey = `${chatId}_${groupId}`;
      botState.waitingContact.set(contactKey, { group, step: 'awaiting_name' });

      await bot.sendMessage(chatId,
        `🛒 *${group.name}*\n\n` +
        `👥 ${group.members || 0} membros\n` +
        `💰 *${formatMoney(group.price)}*\n\n` +
        `Para continuar, me informe seu *nome*:`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '🔙 Cancelar', callback_data: 'catalogo' }]],
          },
        }
      );
      return;
    }
  });

  // Regular messages (name, contact, payment proof, support)
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (!msg.text || msg.text.startsWith('/')) {
      if ((msg.photo || msg.document) && !msg.text?.startsWith('/')) {
        const conf = paymentConfirmations.get(String(chatId));
        if (conf && conf.status === 'pending') {
          conf.status = 'proof_sent';
          if (typeof onPaymentConfirm === 'function') {
            onPaymentConfirm({
              chatId: String(chatId), name: msg.from.first_name, username: msg.from.username,
              groupId: conf.groupId, groupName: conf.groupName, value: conf.value,
              botId: id, botName: name,
            });
          }

          await bot.sendMessage(chatId,
            `✅ *Comprovante Recebido!*\n\n` +
            `Estamos verificando seu pagamento.\n` +
            `Assim que confirmarmos, enviaremos o link do grupo! 🎉`,
            { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: '📦 Catálogo', callback_data: 'catalogo' }]] } }
          );
          return;
        }
      }
      return;
    }

    // Waiting for contact info (name → contact)
    for (const [key, data] of botState.waitingContact) {
      if (key.startsWith(String(chatId))) {
        if (data.step === 'awaiting_name') {
          data.customerName = msg.text;
          data.step = 'awaiting_contact';
          await bot.sendMessage(chatId,
            '📱 Agora informe seu *WhatsApp* ou @username do Telegram:',
            { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: '🔙 Cancelar', callback_data: 'catalogo' }]] } }
          );
          return;
        } else if (data.step === 'awaiting_contact') {
          data.customerContact = msg.text;
          data.step = 'completed';

          const pixCfg = pixConfig || { pixKey: 'hive@pix.com', merchantName: 'Hive' };
          const paymentId = 'PIX-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();

          let payment;
          try {
            payment = await createPixPayment(pixCfg, {
              productName: data.group.name, productPrice: data.group.price,
              customerName: data.customerName, paymentId,
            });
          } catch (e) {
            payment = {
              status: 'pending', pixKey: pixCfg.pixKey || 'hive@pix.com',
              total: data.group.price, paymentId, gateway: 'static',
              instructions: `💳 PIX\n\nValor: ${formatMoney(data.group.price)}\nChave: ${pixCfg.pixKey || 'hive@pix.com'}`,
            };
          }

          const orderData = {
            botId: id, botName: name, groupId: data.group.id, groupName: data.group.name,
            value: data.group.price, customerName: data.customerName,
            customerContact: data.customerContact, chatId: String(chatId),
            status: 'pending', paymentId, createdAt: new Date().toISOString(),
          };

          if (typeof onOrder === 'function') onOrder(orderData);

          paymentConfirmations.set(String(chatId), {
            groupId: data.group.id, groupName: data.group.name,
            value: data.group.price, status: 'pending', groupLink: data.group.inviteLink,
          });

          if (payment.qrCodeDataUrl) {
            await bot.sendPhoto(chatId, payment.qrCodeDataUrl, {
              caption: `💳 *Pagamento — ${formatMoney(data.group.price)}*\n\nEscaneie o QR Code com seu banco`,
              parse_mode: 'Markdown',
            });
            await bot.sendMessage(chatId,
              `📋 *Ou copie o código PIX:*\n\`${payment.qrCodeText}\`\n\n📌 Depois de pagar, clique em "Enviei o Comprovante"`,
              {
                parse_mode: 'Markdown',
                reply_markup: {
                  inline_keyboard: [
                    [{ text: '✅ Enviei o Comprovante', callback_data: 'menu' }],
                    [{ text: '📦 Catálogo', callback_data: 'catalogo' }],
                  ],
                },
              }
            );
          } else {
            await bot.sendMessage(chatId,
              `${payment.instructions}\n\n📌 Após pagar, envie o comprovante aqui.`,
              { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: '📦 Catálogo', callback_data: 'catalogo' }]] } }
            );
          }

          botState.waitingContact.delete(key);
          return;
        }
      }
    }

    if (botState.waitingSupport.has(chatId)) {
      await bot.sendMessage(chatId, '📩 Mensagem recebida! Responderemos em breve.',
        { reply_markup: { inline_keyboard: [[{ text: '🔙 Menu', callback_data: 'menu' }]] } }
      );
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

  return { ok: true, info: { id, name } };
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
      `✅ Seu acesso foi liberado!\n\n` +
      `👇 *Clique para entrar no grupo:*\n` +
      `${inviteLink}\n\n` +
      `🔥 Bem-vindo(a) ao clube VIP!`,
      {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [{ text: '👥 Entrar no Grupo', url: inviteLink }],
            [{ text: '📦 Ver Mais Grupos', callback_data: 'catalogo' }],
          ],
        },
      }
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
