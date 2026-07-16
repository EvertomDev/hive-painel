import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, GlassCard } from '../components/ui/AnimatedContainer';
import { Send, Clock, CheckCircle, AlertCircle, Trash2, Plus, X, Bold, Italic, Underline, Link, FileImage, Paperclip, CalendarDays, Bot, Users, Eye, Image, Video, Music } from 'lucide-react';

const STORAGE_KEY = 'zeze-postagens';

function loadPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function Postagens() {
  const { state, addActivity, addNotification } = useApp();
  const [tab, setTab] = useState('enviar');
  const [selectedBot, setSelectedBot] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedCdn, setSelectedCdn] = useState('');
  const [message, setMessage] = useState('');
  const [media, setMedia] = useState(null);
  const [buttons, setButtons] = useState([]);
  const [buttonText, setButtonText] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  const [posts, setPosts] = useState(loadPosts);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  const bots = state.bots.filter(b => b.status !== 'inactive');
  const selectedBotData = bots.find(b => b.id === selectedBot || b.name === selectedBot);
  const groups = state.groups.filter(g => g.active);
  const filteredGroups = selectedBotData ? groups : [];

  const handleAddButton = () => {
    if (!buttonText) return;
    setButtons([...buttons, { text: buttonText, url: buttonUrl || undefined }]);
    setButtonText('');
    setButtonUrl('');
  };

  const handleRemoveButton = (i) => {
    setButtons(buttons.filter((_, idx) => idx !== i));
  };

  const handleSend = () => {
    if (!selectedBot || !message) return;
    const post = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
      bot: selectedBot,
      group: selectedGroup,
      cdn: selectedCdn,
      message,
      media,
      buttons: [...buttons],
      status: scheduleDate ? 'Agendado' : 'Enviado',
      schedule: scheduleDate ? `${scheduleDate} ${scheduleTime}` : null,
      sentAt: scheduleDate ? null : new Date().toISOString(),
      recipients: selectedGroup ? groups.find(g => g.id === selectedGroup)?.members || 0 : 0,
    };
    setPosts([post, ...posts]);
    addActivity(`Postagem enviada via ${selectedBot}`, 'success');
    addNotification('Postagem enviada', `Mensagem enviada via ${selectedBot}`);
    setMessage('');
    setMedia(null);
    setButtons([]);
    setSelectedGroup('');
    setSelectedCdn('');
    setScheduleDate('');
    setScheduleTime('');
  };

  const handleSchedule = () => {
    if (!selectedBot || !message || !scheduleDate) return;
    handleSend();
  };

  const handleDeletePost = (id) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  const insertFormat = (tag, value = '') => {
    const textarea = document.getElementById('msg-input');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = message.substring(start, end);
    const wrapped = tag === 'bold' ? `**${selected || 'texto'}**` :
      tag === 'italic' ? `_${selected || 'texto'}_` :
      tag === 'underline' ? `__${selected || 'texto'}__` :
      tag === 'link' ? `[${selected || 'texto'}](${value || 'https://'})` : selected;
    setMessage(message.substring(0, start) + wrapped + message.substring(end));
  };

  const formatPreview = (txt) => {
    return txt
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/__(.+?)__/g, '<u>$1</u>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[var(--brand-500)] underline">$1</a>')
      .replace(/\n/g, '<br/>');
  };

  const scheduledPosts = posts.filter(p => p.status === 'Agendado');
  const sentPosts = posts.filter(p => p.status === 'Enviado');

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-white font-bold">Postagens</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">Disparo de mensagens para grupos e canais</p>
        </div>

        <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] w-fit">
          <button onClick={() => setTab('enviar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'enviar' ? 'bg-[var(--brand-500)] text-white shadow-sm' : 'text-[#a1a1aa] hover:text-white'}`}>
            <Send size={15} /> Enviar Agora
          </button>
          <button onClick={() => setTab('agendadas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'agendadas' ? 'bg-[var(--brand-500)] text-white shadow-sm' : 'text-[#a1a1aa] hover:text-white'}`}>
            <Clock size={15} /> Agendadas {scheduledPosts.length > 0 && <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-white/20">{scheduledPosts.length}</span>}
          </button>
        </div>

        {tab === 'enviar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <GlassCard className="p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Send size={15} className="text-[var(--brand-500)]" /> Nova Postagem</h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#a1a1aa] mb-1.5 font-medium uppercase tracking-wider">Bot</label>
                      <div className="relative">
                        <Bot size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b]" />
                        <select value={selectedBot} onChange={e => { setSelectedBot(e.target.value); setSelectedGroup(''); setSelectedCdn(''); }}
                          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:ring-1 focus:ring-[var(--brand-500)] outline-none appearance-none">
                          <option value="">Selecione um bot</option>
                          {bots.map(b => <option key={b.id || b.name} value={b.name || b.id}>{b.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#a1a1aa] mb-1.5 font-medium uppercase tracking-wider">Grupo / Canal (Destino)</label>
                      <div className="relative">
                        <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b]" />
                        <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}
                          disabled={!selectedBot}
                          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:ring-1 focus:ring-[var(--brand-500)] outline-none appearance-none disabled:opacity-40">
                          <option value="">{selectedBot ? 'Selecione um grupo' : 'Selecione um bot primeiro'}</option>
                          {filteredGroups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.members || 0} membros)</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#a1a1aa] mb-1.5 font-medium uppercase tracking-wider">Canal CDN (Armazenamento)</label>
                      <div className="relative">
                        <Image size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b]" />
                        <select value={selectedCdn} onChange={e => setSelectedCdn(e.target.value)}
                          disabled={!selectedBot}
                          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:ring-1 focus:ring-[var(--brand-500)] outline-none appearance-none disabled:opacity-40">
                          <option value="">{selectedBot ? 'Selecione um canal' : 'Selecione um bot primeiro'}</option>
                          {filteredGroups.filter(g => g.category === 'vip' || g.category === 'combo').map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/[0.06] pt-4">
                    <div className="flex items-center gap-1 mb-3">
                      <span className="text-[11px] text-[#a1a1aa] font-medium uppercase tracking-wider">Preview</span>
                      <div className="flex-1 h-px bg-white/[0.06] ml-2"></div>
                    </div>
                    <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 min-h-[80px]">
                      {message ? (
                        <div className="text-sm text-white leading-relaxed" dangerouslySetInnerHTML={{ __html: formatPreview(message) }} />
                      ) : (
                        <p className="text-sm text-[#52525b] italic">Digite uma mensagem para ver o preview...</p>
                      )}
                      {buttons.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/[0.06]">
                          {buttons.map((btn, i) => (
                            <span key={i} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--brand-500)]/20 text-[var(--brand-500)] border border-[var(--border-brand)]">
                              {btn.text}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#a1a1aa] mb-2 font-medium uppercase tracking-wider">Mídia (Opcional)</label>
                    <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.04] border border-dashed border-white/[0.08]">
                      <button onClick={() => setMedia(media === 'image' ? null : 'image')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all ${media === 'image' ? 'bg-[var(--brand-500)]/20 text-[var(--brand-500)] border border-[var(--border-brand)]' : 'text-[#a1a1aa] hover:text-white hover:bg-white/[0.04]'}`}>
                        <Image size={15} /> Imagem
                      </button>
                      <button onClick={() => setMedia(media === 'video' ? null : 'video')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all ${media === 'video' ? 'bg-[var(--brand-500)]/20 text-[var(--brand-500)] border border-[var(--border-brand)]' : 'text-[#a1a1aa] hover:text-white hover:bg-white/[0.04]'}`}>
                        <Video size={15} /> Vídeo
                      </button>
                      <button onClick={() => setMedia(media === 'audio' ? null : 'audio')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all ${media === 'audio' ? 'bg-[var(--brand-500)]/20 text-[var(--brand-500)] border border-[var(--border-brand)]' : 'text-[#a1a1aa] hover:text-white hover:bg-white/[0.04]'}`}>
                        <Music size={15} /> Áudio
                      </button>
                      <span className="text-[10px] text-[#52525b] ml-auto pr-2">Imagem (10MB) • Vídeo/Áudio (50MB)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <button onClick={() => insertFormat('bold')} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#a1a1aa] hover:text-white transition-colors" title="Negrito"><Bold size={14} /></button>
                      <button onClick={() => insertFormat('italic')} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#a1a1aa] hover:text-white transition-colors" title="Itálico"><Italic size={14} /></button>
                      <button onClick={() => insertFormat('underline')} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#a1a1aa] hover:text-white transition-colors" title="Sublinhado"><Underline size={14} /></button>
                      <button onClick={() => { const url = prompt('URL do link:'); if (url) insertFormat('link', url); }} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#a1a1aa] hover:text-white transition-colors" title="Link"><Link size={14} /></button>
                      <div className="w-px h-5 bg-white/[0.06] mx-1"></div>
                      <span className="text-[11px] text-[#52525b]">Formatação Telegram</span>
                    </div>
                    <textarea id="msg-input" value={message} onChange={e => setMessage(e.target.value)} rows={5}
                      placeholder="Digite sua mensagem aqui... Use os botões acima para formatar"
                      className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525b] focus:ring-1 focus:ring-[var(--brand-500)] outline-none resize-none" />
                  </div>

                  <div className="border-t border-white/[0.06] pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] text-[#a1a1aa] font-medium uppercase tracking-wider">Botões (Opcional)</span>
                      <span className="text-[10px] text-[#52525b]">{buttons.length} adicionados</span>
                    </div>
                    {buttons.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {buttons.map((btn, i) => (
                          <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                            <span className="text-xs text-white">{btn.text}</span>
                            {btn.url && <span className="text-[10px] text-[#52525b] truncate max-w-[100px]">{btn.url}</span>}
                            <button onClick={() => handleRemoveButton(i)} className="text-[#a1a1aa] hover:text-red-400 ml-1"><X size={12} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input value={buttonText} onChange={e => setButtonText(e.target.value)} placeholder="Texto do botão"
                        className="flex-1 px-3 py-2 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525b] focus:ring-1 focus:ring-[var(--brand-500)] outline-none" />
                      <input value={buttonUrl} onChange={e => setButtonUrl(e.target.value)} placeholder="URL (opcional)"
                        className="flex-1 px-3 py-2 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525b] focus:ring-1 focus:ring-[var(--brand-500)] outline-none" />
                      <button onClick={handleAddButton} disabled={!buttonText}
                        className="px-3 py-2 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1">
                        <Plus size={14} /> Adicionar
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/[0.06] pt-4 flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[#a1a1aa]">
                      <CalendarDays size={14} />
                      <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                        className="px-3 py-2 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:ring-1 focus:ring-[var(--brand-500)] outline-none" />
                    </div>
                    <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                      className="px-3 py-2 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:ring-1 focus:ring-[var(--brand-500)] outline-none" />
                    <div className="flex-1"></div>
                    <button onClick={scheduleDate ? handleSchedule : handleSend} disabled={!selectedBot || !message}
                      className="px-5 py-2.5 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2">
                      {scheduleDate ? <Clock size={15} /> : <Send size={15} />}
                      {scheduleDate ? 'Agendar Mensagem' : 'Enviar Mensagem'}
                    </button>
                  </div>
                </div>
              </GlassCard>
            </div>

            <div className="space-y-4">
              <GlassCard className="p-5">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Clock size={14} className="text-[var(--brand-500)]" /> Histórico Recente</h3>
                {sentPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <Send size={24} className="mx-auto mb-2 text-[#52525b]" />
                    <p className="text-xs text-[#52525b]">Nenhum envio ainda</p>
                    <p className="text-[10px] text-[#52525b] mt-1">as mensagens são do bot e do grupo</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-none">
                    {sentPosts.slice(0, 20).map((p) => {
                      const bot = bots.find(b => b.name === p.bot || b.id === p.bot);
                      const grp = groups.find(g => g.id === p.group);
                      return (
                        <div key={p.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all group">
                          <div className="flex items-start gap-2.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-white leading-relaxed line-clamp-2">{p.message}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-[var(--brand-500)]">{bot?.name || p.bot}</span>
                                {grp && <span className="text-[10px] text-[#52525b]">→ {grp.name}</span>}
                                {p.recipients > 0 && <span className="text-[10px] text-[#52525b]">{p.recipients} recipients</span>}
                              </div>
                              {p.sentAt && (
                                <p className="text-[10px] text-[#52525b] mt-1">{new Date(p.sentAt).toLocaleString('pt-BR')}</p>
                              )}
                            </div>
                            <button onClick={() => handleDeletePost(p.id)} className="opacity-0 group-hover:opacity-100 p-1 text-[#52525b] hover:text-red-400 transition-all">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduledPosts.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <Clock size={32} className="mx-auto mb-3 text-[#52525b]" />
                <p className="text-sm text-[#a1a1aa]">Nenhuma postagem agendada</p>
                <p className="text-xs text-[#52525b] mt-1">Agende mensagens para enviar automaticamente</p>
              </GlassCard>
            ) : (
              scheduledPosts.map(p => {
                const bot = bots.find(b => b.name === p.bot || b.id === p.bot);
                const grp = groups.find(g => g.id === p.group);
                return (
                  <GlassCard key={p.id} className="flex items-center gap-4 p-4" hover={false}>
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                      <Clock size={18} className="text-[var(--brand-500)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.message}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[var(--brand-500)]">{bot?.name || p.bot}</span>
                        {grp && <span className="text-[10px] text-[#52525b]">→ {grp.name}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-[var(--brand-500)]/20 text-[var(--brand-500)]">Agendado</span>
                      {p.schedule && <p className="text-[10px] text-[#52525b] mt-1">{p.schedule}</p>}
                    </div>
                    <button onClick={() => handleDeletePost(p.id)} className="p-2 text-[#52525b] hover:text-red-400 rounded-lg hover:bg-white/[0.04] transition-all">
                      <Trash2 size={14} />
                    </button>
                  </GlassCard>
                );
              })
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default Postagens;
