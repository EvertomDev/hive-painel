import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard } from '../components/ui/AnimatedContainer';
import { PlatformIcon, getPlatformMeta } from '../components/accounts/PlatformIcon';
import { Send, MessageCircle, RefreshCw, QrCode, Plus, X, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const intervalRef = useRef(null);

  const activeAccounts = state.accounts.filter(a => ['telegram', 'whatsapp'].includes(a.platform));

  useEffect(() => {
    if (!selectedAccount) return;
    loadChats();
    intervalRef.current = setInterval(loadChats, 10000);
    return () => clearInterval(intervalRef.current);
  }, [selectedAccount]);

  useEffect(() => {
    if (selectedChat) loadMessages();
  }, [selectedChat]);

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
    e.preventDefault();
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
      }
    } catch (e) {}
    setLoading(false);
  };

  return (
    <PageTransition>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Sidebar de contas */}
        <div className="w-72 flex flex-col border-r border-border bg-card shrink-0">
          <div className="p-4 border-b border-border">
            <h1 className="text-lg font-bold text-card-foreground">Mensagens</h1>
            <p className="text-xs text-muted-foreground">WhatsApp e Telegram integrados</p>
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
              return (
                <div
                  key={acc.id}
                  onClick={() => { setSelectedAccount(acc); setSelectedChat(null); setMessages([]); if (acc.platform === 'telegram') startTelegram(acc); }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${isActive ? 'bg-primary/10 border-primary/30' : 'bg-card border-border hover:bg-muted/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                        {acc.photo ? <img src={acc.photo} alt="" className="w-full h-full object-cover" /> : <PlatformIcon platform={acc.platform} size={20} />}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${status === 'ready' || status === 'online' ? 'bg-chart-1' : status === 'error' ? 'bg-destructive' : 'bg-chart-3'}`}></span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-card-foreground truncate">{acc.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{acc.identifier}</p>
                    </div>
                  </div>
                  {acc.platform === 'whatsapp' && status !== 'ready' && (
                    <button onClick={e => { e.stopPropagation(); startWhatsApp(acc); }} className="mt-2 w-full py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                      Conectar WhatsApp
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista de chats */}
        <div className="w-80 flex flex-col border-r border-border bg-card/50 shrink-0">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-card-foreground">Conversas</span>
            <button onClick={loadChats} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {selectedAccount ? chats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Nenhuma conversa encontrada</div>
            ) : chats.map(chat => (
              <div
                key={chat.chatId}
                onClick={() => setSelectedChat(chat)}
                className={`p-3 border-b border-border/50 cursor-pointer transition-colors ${selectedChat?.chatId === chat.chatId ? 'bg-muted' : 'hover:bg-muted/50'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-card-foreground truncate">{chat.name}</h4>
                  {chat.unread > 0 && <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] rounded-full font-bold">{chat.unread}</span>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(chat.lastDate).toLocaleString('pt-BR')}</p>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground text-sm">Selecione uma conta</div>
            )}
          </div>
        </div>

        {/* Área de chat */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {selectedChat ? (
            <>
              <div className="px-4 py-3 border-b border-border bg-card flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-card-foreground">{selectedChat.name}</h3>
                  <p className="text-xs text-muted-foreground">{getPlatformMeta(selectedAccount.platform).label}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col-reverse">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.direction === 'out' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${msg.direction === 'out' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card border border-border text-card-foreground rounded-bl-md'}`}>
                      <p>{msg.text}</p>
                      <span className="text-[10px] opacity-70 mt-1 block">{new Date(msg.date).toLocaleTimeString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSend} className="p-4 border-t border-border bg-card flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Digite uma mensagem..." className="flex-1 px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" />
                <button type="submit" disabled={loading || !input.trim()} className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg transition-colors">
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <AnimatedCard className="max-w-sm text-center p-8 bg-card rounded-2xl border border-border shadow-sm">
                <MessageCircle size={40} className="mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-bold text-card-foreground mb-2">Central de Mensagens</h3>
                <p className="text-sm text-muted-foreground">Selecione uma conta e uma conversa para começar a responder seus clientes.</p>
              </AnimatedCard>
            </div>
          )}
        </div>
      </div>

      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm p-6 text-center">
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
              </div>
            )}
            {qrModal.status === 'ready' && (
              <div className="py-8">
                <CheckCircle2 size={48} className="text-chart-1 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">WhatsApp conectado com sucesso!</p>
              </div>
            )}
            {qrModal.status === 'error' && (
              <div className="py-8">
                <AlertCircle size={48} className="text-destructive mx-auto mb-3" />
                <p className="text-sm text-destructive">{qrModal.error || 'Erro ao conectar'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </PageTransition>
  );
}

export default Messages;
