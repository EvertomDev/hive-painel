import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard } from '../components/ui/AnimatedContainer';
import { PlatformIcon, getPlatformMeta } from '../components/accounts/PlatformIcon';
import { SearchInput } from '../components/shared/SearchInput';
import { EmptyState } from '../components/shared/EmptyState';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { Send, MessageCircle, RefreshCw, X, CheckCircle2, AlertCircle, Search, Smile, Forward, Trash2, Copy, CheckCheck, Clock, MoreVertical } from 'lucide-react';

const EMOJIS = ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','😘','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😰','😱','😳','🤪','😵','😡','😠','🤬','👍','👎','👊','✊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✌️','🤟','🤘','👌','❤️','🧡','💛','💚','💙','💜','🖤','💔','💕','💞','💗','💖','💘','💝','🎉','🎊','🎈','🔥','⭐','✨','💯','✅','❌','‼️','❓','❗','💪','🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛'];

function groupByDate(messages) {
  const groups = {};
  messages.forEach(msg => {
    const date = new Date(msg.date).toLocaleDateString('pt-BR');
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
  });
  return Object.entries(groups);
}

function Messages() {
  const { state, dispatch, helpers, addActivity, addNotification } = useApp();
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrModal, setQrModal] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [showEmoji, setShowEmoji] = useState(false);
  const [searchMsg, setSearchMsg] = useState('');
  const [forwarding, setForwarding] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [typing, setTyping] = useState(false);
  const intervalRef = useRef(null);
  const msgContainerRef = useRef(null);
  const emojiRef = useRef(null);
  const inputRef = useRef(null);

  const activeAccounts = state.accounts.filter(a => ['telegram', 'whatsapp'].includes(a.platform));

  const chatsTotal = useMemo(() => chats.reduce((a, c) => a + (c.unread || 0), 0), [chats]);

  useEffect(() => {
    if (!selectedAccount) return;
    loadChats();
    intervalRef.current = setInterval(loadChats, 10000);
    return () => clearInterval(intervalRef.current);
  }, [selectedAccount]);

  useEffect(() => {
    if (selectedChat) loadMessages();
  }, [selectedChat]);

  useEffect(() => {
    const handleClick = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredMessages = useMemo(() => {
    if (!searchMsg) return messages;
    return messages.filter(m => m.text?.toLowerCase().includes(searchMsg.toLowerCase()));
  }, [messages, searchMsg]);

  const messageGroups = useMemo(() => groupByDate(filteredMessages), [filteredMessages]);

  const loadChats = async () => {
    if (!selectedAccount) return;
    try {
      const endpoint = selectedAccount.platform === 'telegram' ? '/api/telegram/chats' : '/api/whatsapp/chats';
      const body = selectedAccount.platform === 'telegram'
        ? { token: selectedAccount.identifier }
        : { sessionId: selectedAccount.id };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        setChats(data.chats || []);
        setStatuses(s => ({ ...s, [selectedAccount.id]: 'ready' }));
      } else {
        setStatuses(s => ({ ...s, [selectedAccount.id]: 'error' }));
      }
    } catch (e) {
      setStatuses(s => ({ ...s, [selectedAccount.id]: 'error' }));
    }
  };

  const loadMessages = async () => {
    if (!selectedAccount || !selectedChat) return;
    try {
      const endpoint = selectedAccount.platform === 'telegram' ? '/api/telegram/messages' : '/api/whatsapp/messages';
      const body = selectedAccount.platform === 'telegram'
        ? { token: selectedAccount.identifier, chatId: selectedChat.chatId }
        : { sessionId: selectedAccount.id, chatId: selectedChat.chatId };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) setMessages(data.messages || []);
    } catch (e) {}
    setTyping(false);
  };

  const startTelegram = async (account) => {
    try {
      const res = await fetch('/api/telegram/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: account.identifier }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatuses(s => ({ ...s, [account.id]: 'ready' }));
        addActivity(`Bot Telegram ${account.name} conectado`, 'success');
      } else {
        setStatuses(s => ({ ...s, [account.id]: 'error' }));
        addNotification('Erro Telegram', data.error || 'Não foi possível conectar');
      }
    } catch (e) {
      setStatuses(s => ({ ...s, [account.id]: 'error' }));
    }
  };

  const startWhatsApp = async (account) => {
    setQrModal({ account, qr: null, status: 'connecting' });
    try {
      const res = await fetch('/api/whatsapp/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: account.id }),
      });
      const data = await res.json();
      if (data.ok) {
        setQrModal({ account, qr: data.qr, status: data.status });
        setStatuses(s => ({ ...s, [account.id]: data.status }));
        if (data.status === 'ready') {
          addActivity(`WhatsApp ${account.name} conectado`, 'success');
        }
      } else {
        setQrModal({ account, qr: null, status: 'error', error: data.error });
        setStatuses(s => ({ ...s, [account.id]: 'error' }));
      }
    } catch (e) {
      setQrModal({ account, qr: null, status: 'error', error: e.message });
      setStatuses(s => ({ ...s, [account.id]: 'error' }));
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || !selectedAccount || !selectedChat) return;
    setLoading(true);
    try {
      const endpoint = selectedAccount.platform === 'telegram' ? '/api/telegram/send-message' : '/api/whatsapp/send-message';
      const body = selectedAccount.platform === 'telegram'
        ? { token: selectedAccount.identifier, chatId: selectedChat.chatId, text: input }
        : { sessionId: selectedAccount.id, chatId: selectedChat.chatId, text: input };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        setMessages([data.message, ...messages]);
        setInput('');
        setShowEmoji(false);
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleForward = async (msg) => {
    if (!forwarding) return;
    try {
      const endpoint = selectedAccount.platform === 'telegram' ? '/api/telegram/send-message' : '/api/whatsapp/send-message';
      const body = selectedAccount.platform === 'telegram'
        ? { token: selectedAccount.identifier, chatId: forwarding.chatId, text: `🔁 Encaminhado:\n${msg.text}` }
        : { sessionId: selectedAccount.id, chatId: forwarding.chatId, text: `🔁 Encaminhado:\n${msg.text}` };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        addActivity('Mensagem encaminhada', 'success');
        setForwarding(null);
      }
    } catch (e) {}
  };

  const handleDeleteChat = () => {
    setChats(chats.filter(c => c.chatId !== selectedChat.chatId));
    setSelectedChat(null);
    setMessages([]);
    setConfirmDelete(null);
    addActivity('Conversa removida', 'warning');
  };

  const insertEmoji = (emoji) => {
    setInput(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isChatSelected = !!selectedChat;
  const isAccountSelected = !!selectedAccount;

  return (
    <PageTransition>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <div className="w-72 flex flex-col border-r border-border bg-card shrink-0">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-lg font-bold text-card-foreground">Mensagens</h1>
              <span className="text-xs text-muted-foreground">{activeAccounts.length} contas</span>
            </div>
            <p className="text-xs text-muted-foreground">WhatsApp e Telegram {chatsTotal > 0 && <span className="text-chart-1 font-semibold">• {chatsTotal} não lidas</span>}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {activeAccounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                Nenhuma conta de mensagem. Adicione em Contas.
              </div>
            ) : activeAccounts.map(acc => {
              const status = statuses[acc.id] || acc.status;
              const isActive = selectedAccount?.id === acc.id;
              const unreadCount = chats.filter(c => c.platform === acc.platform).reduce((a, c) => a + (c.unread || 0), 0);
              return (
                <div key={acc.id} onClick={() => { setSelectedAccount(acc); setSelectedChat(null); setMessages([]); if (acc.platform === 'telegram') startTelegram(acc); }} className={`p-3 rounded-xl border cursor-pointer transition-all ${isActive ? 'bg-primary/10 border-primary/30' : 'bg-card border-border hover:bg-muted/50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                        {acc.photo ? <img src={acc.photo} alt="" className="w-full h-full object-cover" /> : <PlatformIcon platform={acc.platform} size={20} />}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${status === 'ready' || status === 'online' ? 'bg-chart-1' : status === 'error' ? 'bg-destructive' : 'bg-chart-3'}`}></span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-card-foreground truncate">{acc.name}</h3>
                        {unreadCount > 0 && <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] rounded-full font-bold ml-1">{unreadCount}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{acc.identifier}</p>
                    </div>
                  </div>
                  {acc.platform === 'whatsapp' && status !== 'ready' && (
                    <button onClick={e => { e.stopPropagation(); startWhatsApp(acc); }} className="mt-2 w-full py-1.5 text-xs bg-chart-3/15 text-chart-3 rounded-lg hover:bg-chart-3/25 transition-colors font-medium">
                      Conectar WhatsApp
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-80 flex flex-col border-r border-border bg-card/50 shrink-0">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-card-foreground">Conversas</span>
            <div className="flex gap-1">
              {isAccountSelected && <button onClick={loadChats} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Atualizar"><RefreshCw size={14} /></button>}
            </div>
          </div>
          {isAccountSelected && (
            <SearchInput value={searchMsg} onChange={setSearchMsg} placeholder="Buscar mensagens..." className="px-3 py-2 border-b border-border/50" />
          )}
          <div className="flex-1 overflow-y-auto">
            {isAccountSelected ? chats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Nenhuma conversa encontrada</div>
            ) : chats.map(chat => (
              <div key={chat.chatId} onClick={() => setSelectedChat(chat)} className={`p-3 border-b border-border/50 cursor-pointer transition-colors ${selectedChat?.chatId === chat.chatId ? 'bg-muted' : 'hover:bg-muted/50'}`}>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-card-foreground truncate">{chat.name}</h4>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {chat.unread > 0 && <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] rounded-full font-bold">{chat.unread}</span>}
                    <span className="text-[10px] text-muted-foreground">{new Date(chat.lastDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <MessageCircle size={24} className="mx-auto mb-2 opacity-40" />
                Selecione uma conta
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {isChatSelected ? (
            <>
              <div className="px-4 py-3 border-b border-border bg-card flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-card-foreground">{selectedChat.name}</h3>
                  <p className="text-xs text-muted-foreground">{getPlatformMeta(selectedAccount.platform).label} {typing && <span className="text-chart-1 ml-2 animate-pulse">digitando...</span>}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setConfirmDelete({ chat: true })} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Excluir conversa">
                    <Trash2 size={14} />
                  </button>
                  <button onClick={loadMessages} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Atualizar">
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>
              <div ref={msgContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    {searchMsg ? 'Nenhuma mensagem encontrada' : 'Nenhuma mensagem'}
                  </div>
                ) : messageGroups.map(([date, msgs]) => (
                  <div key={date}>
                    <div className="text-center mb-4">
                      <span className="px-2 py-1 bg-muted rounded-full text-[10px] text-muted-foreground font-medium">{date}</span>
                    </div>
                    <div className="space-y-2">
                      {[...msgs].reverse().map(msg => (
                        <div key={msg.id} className="group flex flex-col">
                          <div className={`flex ${msg.direction === 'out' ? 'justify-end' : 'justify-start'} items-end gap-1`}>
                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm relative ${msg.direction === 'out' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card border border-border text-card-foreground rounded-bl-md'}`}>
                              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-[10px] opacity-70">{new Date(msg.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                {msg.direction === 'out' && <CheckCheck size={12} className="opacity-70" />}
                              </div>
                            </div>
                            <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pb-2">
                              <button onClick={() => handleForward(msg)} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors" title="Encaminhar">
                                <Forward size={12} />
                              </button>
                              <button onClick={() => { navigator.clipboard.writeText(msg.text); addActivity('Mensagem copiada', 'success'); }} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors" title="Copiar">
                                <Copy size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {forwarding && (
                <div className="px-4 py-2 bg-chart-3/10 border-t border-chart-3/20 flex items-center justify-between text-sm animate-fade-in">
                  <span className="text-chart-3 font-medium">Encaminhando para {forwarding.name}</span>
                  <button onClick={() => setForwarding(null)} className="p-1 text-muted-foreground hover:text-foreground"><X size={14} /></button>
                </div>
              )}
              <form onSubmit={handleSend} className="p-4 border-t border-border bg-card">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Digite uma mensagem..." className="w-full px-4 py-2.5 pr-10 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all text-sm" />
                    <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      <Smile size={18} />
                    </button>
                    {showEmoji && (
                      <div ref={emojiRef} className="absolute bottom-full right-0 mb-2 p-2 bg-card border border-border rounded-xl shadow-2xl w-72 max-h-48 overflow-y-auto grid grid-cols-8 gap-1 animate-fade-in z-50">
                        {EMOJIS.map((emoji, i) => (
                          <button key={i} type="button" onClick={() => insertEmoji(emoji)} className="p-1 hover:bg-muted rounded-lg text-lg transition-colors">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="submit" disabled={loading || !input.trim()} className="px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg transition-colors">
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <EmptyState
                icon={MessageCircle}
                title="Central de Mensagens"
                description="Selecione uma conta e uma conversa para começar a responder seus clientes em tempo real."
              />
            </div>
          )}
        </div>
      </div>

      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setQrModal(null)}>
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-card-foreground">Conectar WhatsApp</h3>
              <button onClick={() => setQrModal(null)} className="p-1 text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            {qrModal.status === 'connecting' && (
              <div className="py-8">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
              </div>
            )}
            {qrModal.status === 'qr' && qrModal.qr && (
              <div>
                <img src={qrModal.qr} alt="QR Code WhatsApp" className="w-48 h-48 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Abra o WhatsApp no celular e escaneie o QR Code.</p>
                <p className="text-xs text-muted-foreground mt-2">O QR expira em 60 segundos</p>
              </div>
            )}
            {qrModal.status === 'ready' && (
              <div className="py-8">
                <CheckCircle2 size={48} className="text-chart-1 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">WhatsApp conectado com sucesso!</p>
                <button onClick={() => setQrModal(null)} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Fechar</button>
              </div>
            )}
            {qrModal.status === 'error' && (
              <div className="py-8">
                <AlertCircle size={48} className="text-destructive mx-auto mb-3" />
                <p className="text-sm text-destructive">{qrModal.error || 'Erro ao conectar'}</p>
                <button onClick={() => { setQrModal(null); startWhatsApp(qrModal.account); }} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Tentar novamente</button>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete?.chat}
        title="Excluir conversa?"
        message={`Tem certeza que deseja excluir a conversa com ${selectedChat?.name}? As mensagens serão removidas apenas da interface.`}
        variant="danger"
        confirmLabel="Excluir"
        onConfirm={handleDeleteChat}
        onCancel={() => setConfirmDelete(null)}
      />
    </PageTransition>
  );
}

export default Messages;
