import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';
import { Save, Check, RotateCcw, Download, Upload, Trash2, Shield, Bell, Eye, Palette, Database, CreditCard, User, Settings as SettingsIcon, QrCode, Smartphone, Globe, Lock, Copy } from 'lucide-react';

const TABS = [
  { key: 'perfil', label: 'Perfil', icon: User },
  { key: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
  { key: 'notificacoes', label: 'Notificações', icon: Bell },
  { key: 'aparencia', label: 'Aparência', icon: Palette },
  { key: 'dados', label: 'Dados', icon: Database },
  { key: 'sistema', label: 'Sistema', icon: Shield },
];

function Settings() {
  const { state, dispatch, addActivity, addNotification, helpers } = useApp();
  const [tab, setTab] = useState('perfil');
  const [saved, setSaved] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);
  const [copied, setCopied] = useState(false);

  const [perfil, setPerfil] = useState({
    name: state.user.name,
    email: state.user.email,
    plan: state.user.plan,
  });

  const [prefs, setPrefs] = useState({
    webhook: state.config.webhook,
    defaultGateway: state.config.defaultGateway,
    pixDiscount: state.config.pixDiscount,
    moeda: 'BRL',
    idioma: 'pt-BR',
    timezone: 'America/Sao_Paulo',
  });

  const [pix, setPix] = useState({
    chave: state.pixConfig?.pixKey || 'zeze@pix.com',
    merchantName: state.pixConfig?.merchantName || 'Zeze',
    gateway: state.pixConfig?.gateway || 'static',
  });

  const [notificacoes, setNotificacoes] = useState({
    novosPedidos: true,
    pagamentosConfirmados: true,
    novosMembros: true,
    erros: true,
    atividadeDiaria: false,
  });

  const [aparencia, setAparencia] = useState({
    tema: 'system',
    sidebarCompacta: false,
  });

  const handleSave = (section) => {
    switch (section) {
      case 'perfil':
        dispatch({ type: 'SET_USER', payload: perfil });
        break;
      case 'prefs':
        dispatch({ type: 'SET_CONFIG', payload: { webhook: prefs.webhook, defaultGateway: prefs.defaultGateway, pixDiscount: Number(prefs.pixDiscount) } });
        break;
      case 'pix':
        dispatch({ type: 'SET_PIX_CONFIG', payload: { pixKey: pix.chave, merchantName: pix.merchantName, gateway: pix.gateway } });
        break;
    }
    addActivity(`Configurações de ${section} salvas`, 'info');
    setSaved({ ...saved, [section]: true });
    setTimeout(() => setSaved({ ...saved, [section]: false }), 2000);
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_DATA' });
    window.location.reload();
  };

  const handleExport = () => {
    const data = localStorage.getItem('zeze-dashboard-data');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zeze-backup-${helpers.today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addActivity('Backup exportado com sucesso', 'success');
    addNotification('Backup criado', 'Seus dados foram exportados.');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          localStorage.setItem('zeze-dashboard-data', JSON.stringify(data));
          addActivity('Backup importado com sucesso', 'success');
          addNotification('Dados restaurados', 'A página será recarregada.');
          setTimeout(() => window.location.reload(), 1500);
        } catch {
          addActivity('Erro ao importar backup', 'warning');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const appVersion = '2.0.0';

  const TabButton = ({ tab: t }) => {
    const Icon = t.icon;
    return (
      <button key={t.key} onClick={() => setTab(t.key)}
        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${tab === t.key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'}`}>
        <Icon size={16} /> {t.label}
      </button>
    );
  };

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Configurações</h1>
          <p className="text-sm text-muted-foreground mt-1">Personalize seu painel Zeze</p>
        </div>

        <div className="flex gap-1 mb-6 bg-muted/50 rounded-lg p-1 overflow-x-auto animate-fade-in">
          {TABS.map(t => <TabButton key={t.key} tab={t} />)}
        </div>

        {tab === 'perfil' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2"><User size={18} /> Informações da Conta</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Nome</label>
                  <input value={perfil.name} onChange={e => setPerfil({ ...perfil, name: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Email</label>
                  <input value={perfil.email} onChange={e => setPerfil({ ...perfil, email: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Plano</label>
                  <select value={perfil.plan} onChange={e => setPerfil({ ...perfil, plan: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                    <option value="FREE">Free</option>
                    <option value="PRO">Pro</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>
                <AnimatedButton onClick={() => handleSave('perfil')} className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg flex items-center gap-2">
                  {saved.perfil ? <><Check size={16} /> Salvo</> : <><Save size={16} /> Salvar</>}
                </AnimatedButton>
              </div>
            </AnimatedCard>

            <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2"><SettingsIcon size={18} /> Preferências</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Webhook URL</label>
                  <input value={prefs.webhook} onChange={e => setPrefs({ ...prefs, webhook: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Gateway Padrão</label>
                  <select value={prefs.defaultGateway} onChange={e => setPrefs({ ...prefs, defaultGateway: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                    {state.gateways.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Desconto PIX (%)</label>
                    <input type="number" value={prefs.pixDiscount} onChange={e => setPrefs({ ...prefs, pixDiscount: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Moeda</label>
                    <select value={prefs.moeda} onChange={e => setPrefs({ ...prefs, moeda: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                      <option value="BRL">BRL (R$)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>
                <AnimatedButton onClick={() => handleSave('prefs')} className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg flex items-center gap-2">
                  {saved.prefs ? <><Check size={16} /> Salvo</> : <><Save size={16} /> Salvar</>}
                </AnimatedButton>
              </div>
            </AnimatedCard>
          </div>
        )}

        {tab === 'pagamentos' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2"><QrCode size={18} /> Chave PIX</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Chave PIX (CPF/CNPJ/Email/Telefone)</label>
                  <div className="flex gap-2">
                    <input value={pix.chave} onChange={e => setPix({ ...pix, chave: e.target.value })} className="flex-1 px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="zeze@pix.com" />
                    <button onClick={() => { navigator.clipboard.writeText(pix.chave); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors">{copied ? <Check size={16} /> : <Copy size={16} />}</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Nome do Titular</label>
                  <input value={pix.merchantName} onChange={e => setPix({ ...pix, merchantName: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Zeze Content" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Modo do Gateway</label>
                  <select value={pix.gateway} onChange={e => setPix({ ...pix, gateway: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                    <option value="static">PIX Estático (QR Code gerado localmente)</option>
                    <option value="mercado_pago">Mercado Pago (QR Code dinâmico)</option>
                    <option value="pushinpay">PushinPay</option>
                  </select>
                </div>
                <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground">
                  <strong>Modo estático:</strong> QR Code gerado localmente. Cliente precisa enviar comprovante.<br />
                  <strong>Mercado Pago:</strong> QR Code dinâmico com confirmação automática. Precisa de token.
                </div>
                <AnimatedButton onClick={() => handleSave('pix')} className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg flex items-center gap-2">
                  {saved.pix ? <><Check size={16} /> Salvo</> : <><Save size={16} /> Salvar</>}
                </AnimatedButton>
              </div>
            </AnimatedCard>

            <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2"><CreditCard size={18} /> Gateways Conectados</h2>
              <div className="space-y-3">
                {state.gateways.map(g => (
                  <div key={g.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                    <div>
                      <span className="text-sm font-medium text-card-foreground">{g.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{g.type}</span>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${g.connected ? 'bg-chart-1/15 text-chart-1' : 'bg-muted text-muted-foreground'}`}>
                      {g.connected ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <a href="/gateways" className="text-sm text-primary hover:underline">Gerenciar gateways →</a>
              </div>
            </AnimatedCard>
          </div>
        )}

        {tab === 'notificacoes' && (
          <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm max-w-xl">
            <h2 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2"><Bell size={18} /> Alertas do Painel</h2>
            <div className="space-y-3">
              {[
                { key: 'novosPedidos', label: 'Novos pedidos', desc: 'Quando um cliente fizer uma compra' },
                { key: 'pagamentosConfirmados', label: 'Pagamentos confirmados', desc: 'Quando um pagamento for aprovado' },
                { key: 'novosMembros', label: 'Novos membros', desc: 'Quando alguém entrar em um grupo' },
                { key: 'erros', label: 'Erros do sistema', desc: 'Falhas em bots, webhooks ou gateways' },
                { key: 'atividadeDiaria', label: 'Resumo diário', desc: 'Relatório resumido do dia' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-card-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={notificacoes[item.key]} onChange={() => setNotificacoes({ ...notificacoes, [item.key]: !notificacoes[item.key] })} />
                    <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-chart-1 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                  </label>
                </div>
              ))}
            </div>
          </AnimatedCard>
        )}

        {tab === 'aparencia' && (
          <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm max-w-xl">
            <h2 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2"><Palette size={18} /> Aparência</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Tema</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'light', label: 'Claro', icon: Eye },
                    { key: 'dark', label: 'Escuro', icon: Eye },
                    { key: 'system', label: 'Sistema', icon: Smartphone },
                  ].map(t => {
                    const Icon = t.icon;
                    return (
                      <button key={t.key} onClick={() => setAparencia({ ...aparencia, tema: t.key })}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${aparencia.tema === t.key ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/30'}`}>
                        <Icon size={24} />
                        <span className="text-xs font-medium">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <div className="text-sm font-medium text-card-foreground">Sidebar compacta</div>
                  <div className="text-xs text-muted-foreground">Mostrar apenas ícones na sidebar</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={aparencia.sidebarCompacta} onChange={() => setAparencia({ ...aparencia, sidebarCompacta: !aparencia.sidebarCompacta })} />
                  <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-chart-1 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                </label>
              </div>
            </div>
          </AnimatedCard>
        )}

        {tab === 'dados' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2"><Database size={18} /> Backup de Dados</h2>
              <p className="text-sm text-muted-foreground mb-4">Exporte seus dados para manter um backup seguro. Importe um backup anterior para restaurar tudo.</p>
              <div className="flex gap-3">
                <AnimatedButton onClick={handleExport} className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg flex items-center gap-2"><Download size={16} /> Exportar Backup</AnimatedButton>
                <AnimatedButton onClick={handleImport} className="px-5 py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg flex items-center gap-2"><Upload size={16} /> Importar</AnimatedButton>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                <strong>Informação:</strong> Seus dados ficam salvos no navegador (localStorage). Ao limpar o cache do navegador, os dados são perdidos. Faça backup regularmente!
              </div>
            </AnimatedCard>

            <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2"><Trash2 size={18} className="text-destructive" /> Resetar Dados</h2>
              <p className="text-sm text-muted-foreground mb-4">Limpa todos os dados do painel: bots, grupos, vendas, clientes, configurações. Essa ação não pode ser desfeita!</p>
              {!confirmReset ? (
                <AnimatedButton onClick={() => setConfirmReset(true)} className="px-5 py-2 bg-destructive text-destructive-foreground font-semibold rounded-lg flex items-center gap-2">
                  <Trash2 size={16} /> Resetar Todos os Dados
                </AnimatedButton>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg">
                  <span className="text-sm text-destructive font-medium">Tem certeza? Isso apaga TUDO.</span>
                  <AnimatedButton onClick={handleReset} className="px-4 py-2 bg-destructive text-destructive-foreground text-sm font-semibold rounded-lg">Sim, apagar</AnimatedButton>
                  <button onClick={() => setConfirmReset(false)} className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-semibold rounded-lg">Cancelar</button>
                </div>
              )}
            </AnimatedCard>
          </div>
        )}

        {tab === 'sistema' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2"><Shield size={18} /> Informações do Sistema</h2>
              <div className="space-y-3">
                {[
                  { label: 'Versão do App', value: appVersion },
                  { label: 'Framework', value: 'React + Vite' },
                  { label: 'Estilo', value: 'Tailwind CSS v4' },
                  { label: 'Armazenamento', value: 'localStorage' },
                  { label: 'Plataforma', value: navigator.platform },
                  { label: 'Navegador', value: navigator.userAgent.split(' ').slice(-1)[0] || navigator.appCodeName },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium text-card-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </AnimatedCard>

            <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2"><Lock size={18} /> Segurança</h2>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-sm font-medium text-card-foreground mb-1">Token de Acesso</div>
                  <div className="text-xs text-muted-foreground mb-2">Use este token para autenticação em APIs externas.</div>
                  <div className="flex gap-2">
                    <input readOnly value="z7x9k2m4p6q8r1t3v5w0y" className="flex-1 px-3 py-2 text-xs font-mono rounded-lg bg-background border border-input text-foreground" />
                    <button onClick={() => { navigator.clipboard.writeText('z7x9k2m4p6q8r1t3v5w0y'); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium">{copied ? 'Copiado' : 'Copiar'}</button>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-chart-1/10 text-xs text-chart-1">
                  <strong>🔒 Dados seguros:</strong> Todas as informações ficam armazenadas localmente no seu navegador. Nenhum dado é enviado para servidores externos.
                </div>
              </div>
            </AnimatedCard>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default Settings;
