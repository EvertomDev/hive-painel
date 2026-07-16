import React, { useState, useCallback } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';
import { QrCode, Link, Type, Key, Calculator, FileText, CheckCircle, Copy, Check, Loader2, RefreshCw } from 'lucide-react';
import QRCodeLib from 'qrcode';

const TOOLS = [
  { key: 'qrcode', icon: QrCode, title: 'Gerador de QR Code', desc: 'Gere QR Codes para links e textos' },
  { key: 'encurtador', icon: Link, title: 'Encurtador de Link', desc: 'Encurte URLs para compartilhar' },
  { key: 'nick', icon: Type, title: 'Gerador de Nick', desc: 'Crie nicks aleatórios para Telegram' },
  { key: 'validador', icon: Key, title: 'Validador de Token', desc: 'Valide tokens de bots Telegram' },
  { key: 'calculadora', icon: Calculator, title: 'Calculadora de Preços', desc: 'Calcule preços com comissão' },
  { key: 'bio', icon: FileText, title: 'Criador de Bio', desc: 'Gere bios com templates e emojis' },
  { key: 'verificador', icon: CheckCircle, title: 'Verificador de Link', desc: 'Teste se um link está acessível' },
];

const EMOJI_PACKS = [
  { name: 'Tech', emojis: '💻 🖥️ 📱 ⌨️ 🖱️ 💾 🔧 ⚡ 🔌 📡' },
  { name: 'Motivacional', emojis: '🚀 💪 🔥 ⭐ 🏆 💯 ✅ 👊 🎯 💎' },
  { name: 'Natureza', emojis: '🌿 🌺 🌊 ☀️ 🌈 🦋 🌻 🌴 🍃 🌟' },
  { name: 'Negócios', emojis: '📊 💼 📈 🤝 🏢 💰 📝 📋 🎓 🏅' },
  { name: 'Emojis', emojis: '😊 😎 🤩 😉 🙌 ✨ 🎉 💫 👋 🎨' },
];

const BIO_TEMPLATES = [
  '{emoji} {nome} | {area}\n{emoji} {descricao}\n📩 {contato}',
  '{emoji} {cargo} @ {empresa}\n{emoji} {area}\n💬 {descricao}',
  '✨ {nome} ✨\n{emoji} {area}\n🔥 {descricao}\n📩 {contato}',
];

function Ferramentas() {
  const { addActivity, addNotification, helpers } = useApp();
  const [activeTool, setActiveTool] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // QR Code
  const [qrText, setQrText] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Encurtador
  const [shortUrl, setShortUrl] = useState('');
  const [shortResult, setShortResult] = useState('');

  // Nick
  const [nickCount, setNickCount] = useState(5);
  const [nicks, setNicks] = useState([]);

  // Validador
  const [tokenInput, setTokenInput] = useState('');
  const [tokenStatus, setTokenStatus] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  // Calculadora
  const [basePrice, setBasePrice] = useState('');
  const [commission, setCommission] = useState('');
  const [calcResult, setCalcResult] = useState(null);

  // Bio
  const [bioNome, setBioNome] = useState('');
  const [bioArea, setBioArea] = useState('');
  const [bioDescricao, setBioDescricao] = useState('');
  const [bioContato, setBioContato] = useState('');
  const [bioCargo, setBioCargo] = useState('');
  const [bioEmpresa, setBioEmpresa] = useState('');
  const [bioEmojiPack, setBioEmojiPack] = useState(0);
  const [bioTemplate, setBioTemplate] = useState(0);
  const [bioResult, setBioResult] = useState('');

  // Verificador
  const [checkUrl, setCheckUrl] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // QR Code handler
  const handleGenerateQR = useCallback(async () => {
    if (!qrText) return;
    try {
      const url = await QRCodeLib.toDataURL(qrText, { width: 300, margin: 2, color: { dark: '#000', light: '#fff' } });
      setQrDataUrl(url);
      addActivity('QR Code gerado', 'success');
    } catch {
      addActivity('Erro ao gerar QR Code', 'warning');
    }
  }, [qrText, addActivity]);

  // Encurtador handler
  const handleShorten = () => {
    if (!shortUrl) return;
    const hash = helpers.uid().slice(0, 6);
    const result = `https://hive.io/${hash}`;
    setShortResult(result);
    addActivity('Link encurtado: ' + result, 'success');
  };

  // Nick handler
  const handleGenerateNicks = () => {
    const prefixes = ['hive', 'bot', 'vip', 'pro', 'max', 'top', 'plus', 'gold', 'lucky', 'nice', 'real', 'fast', 'easy', 'best', 'super'];
    const suffixes = ['_oficial', '_br', '_vip', '2024', 'shop', '_store', '_digital', 'hub', '_pro', '_max', '_top', 'online', 'club', 'zone', 'live'];
    const generated = [];
    for (let i = 0; i < nickCount; i++) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      const num = Math.floor(Math.random() * 999);
      const variants = [
        `${prefix}_${num}`,
        `${prefix}${suffix}`,
        `${num}_${prefix}`,
        `${prefix}.${num}${suffix}`,
        `${prefix}${num}`,
      ];
      generated.push(variants[i % variants.length]);
    }
    setNicks(generated);
    addActivity(`${nickCount} nicks gerados`, 'success');
  };

  // Validador handler
  const handleValidateToken = async () => {
    if (!tokenInput) return;
    setTokenLoading(true);
    setTokenStatus(null);
    try {
      const res = await fetch('/api/telegram/me', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: tokenInput })
      });
      const data = await res.json();
      if (data.ok) {
        setTokenStatus({ valid: true, message: `✅ Token válido! Bot: @${data.result.username}` });
        addNotification('Token válido', `Bot @${data.result.username} validado com sucesso.`);
      } else {
        setTokenStatus({ valid: false, message: '❌ Token inválido. Verifique e tente novamente.' });
      }
    } catch {
      setTokenStatus({ valid: false, message: '❌ Não foi possível conectar ao servidor.' });
    }
    setTokenLoading(false);
  };

  // Calculadora handler
  const handleCalculate = () => {
    const base = parseFloat(basePrice) || 0;
    const comm = parseFloat(commission) || 0;
    const finalPrice = base / (1 - comm / 100);
    setCalcResult({
      base,
      commission: comm,
      commissionValue: finalPrice - base,
      finalPrice: isFinite(finalPrice) ? finalPrice : 0,
    });
  };

  // Bio handler
  const handleGenerateBio = () => {
    const pack = EMOJI_PACKS[bioEmojiPack];
    const emojis = pack.emojis.split(' ');
    const randomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];
    const template = BIO_TEMPLATES[bioTemplate];
    const result = template
      .replace(/\{emoji\}/g, randomEmoji)
      .replace(/\{nome\}/g, bioNome || 'Seu Nome')
      .replace(/\{area\}/g, bioArea || 'Sua Área')
      .replace(/\{descricao\}/g, bioDescricao || 'Sua descrição aqui')
      .replace(/\{contato\}/g, bioContato || '@seucontato')
      .replace(/\{cargo\}/g, bioCargo || 'Seu Cargo')
      .replace(/\{empresa\}/g, bioEmpresa || 'Sua Empresa');
    setBioResult(result);
    addActivity('Bio gerada com sucesso', 'success');
  };

  // Verificador handler
  const handleCheckLink = async () => {
    if (!checkUrl) return;
    setCheckLoading(true);
    setCheckResult(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(checkUrl, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        setCheckResult({ accessible: true, status: res.status, message: `✅ Link acessível (status ${res.status})` });
      } else {
        setCheckResult({ accessible: false, status: res.status, message: `⚠️ Link retornou status ${res.status}` });
      }
    } catch {
      setCheckResult({ accessible: false, status: 0, message: '❌ Link inacessível ou timeout' });
    }
    setCheckLoading(false);
  };

  const renderToolContent = () => {
    switch (activeTool) {
      case 'qrcode':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">Texto ou URL</label>
              <input value={qrText} onChange={e => setQrText(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="https://exemplo.com" />
            </div>
            <AnimatedButton onClick={handleGenerateQR} disabled={!qrText} className="px-5 py-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold rounded-lg">Gerar QR Code</AnimatedButton>
            {qrDataUrl && (
              <div className="flex flex-col items-center gap-3 p-6 bg-background rounded-xl border border-border">
                <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
                <AnimatedButton onClick={() => copyToClipboard(qrDataUrl, 'qr')} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg flex items-center gap-2">
                  {copiedId === 'qr' ? <Check size={14} /> : <Copy size={14} />} Copiar QR
                </AnimatedButton>
              </div>
            )}
          </div>
        );

      case 'encurtador':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">URL para encurtar</label>
              <input value={shortUrl} onChange={e => setShortUrl(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="https://www.exemplo.com/pagina-longa" />
            </div>
            <AnimatedButton onClick={handleShorten} disabled={!shortUrl} className="px-5 py-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold rounded-lg">Encurtar</AnimatedButton>
            {shortResult && (
              <div className="flex items-center gap-2 p-4 bg-background rounded-xl border border-border">
                <span className="flex-1 text-sm font-mono text-card-foreground">{shortResult}</span>
                <button onClick={() => copyToClipboard(shortResult, 'short')} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  {copiedId === 'short' ? <Check size={16} className="text-chart-1" /> : <Copy size={16} className="text-muted-foreground" />}
                </button>
              </div>
            )}
          </div>
        );

      case 'nick':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-card-foreground">Quantidade:</label>
              <input type="number" min={1} max={20} value={nickCount} onChange={e => setNickCount(parseInt(e.target.value) || 5)} className="w-20 px-3 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none text-center" />
              <AnimatedButton onClick={handleGenerateNicks} className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg flex items-center gap-2"><RefreshCw size={14} /> Gerar</AnimatedButton>
            </div>
            {nicks.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {nicks.map((nick, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <span className="text-sm font-mono text-card-foreground">{nick}</span>
                    <button onClick={() => copyToClipboard(nick, 'nick-' + i)} className="p-1 hover:bg-secondary rounded transition-colors">
                      {copiedId === 'nick-' + i ? <Check size={14} className="text-chart-1" /> : <Copy size={14} className="text-muted-foreground" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'validador':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">Token do Bot Telegram</label>
              <input value={tokenInput} onChange={e => setTokenInput(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none font-mono" placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz" />
            </div>
            <AnimatedButton onClick={handleValidateToken} disabled={tokenLoading || !tokenInput} className="px-5 py-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold rounded-lg flex items-center gap-2">
              {tokenLoading && <Loader2 size={16} className="animate-spin" />}
              {tokenLoading ? 'Validando...' : 'Validar Token'}
            </AnimatedButton>
            {tokenStatus && (
              <div className={`p-4 rounded-xl border ${tokenStatus.valid ? 'bg-chart-1/10 border-chart-1/30 text-chart-1' : 'bg-destructive/10 border-destructive/30 text-destructive'}`}>
                {tokenStatus.message}
              </div>
            )}
          </div>
        );

      case 'calculadora':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Preço Base (R$)</label>
                <input type="number" step="0.01" min="0" value={basePrice} onChange={e => setBasePrice(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="100.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Comissão (%)</label>
                <input type="number" step="0.1" min="0" max="100" value={commission} onChange={e => setCommission(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="10" />
              </div>
            </div>
            <AnimatedButton onClick={handleCalculate} disabled={!basePrice} className="px-5 py-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold rounded-lg">Calcular</AnimatedButton>
            {calcResult && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-background rounded-xl border border-border">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Preço Base</div>
                  <div className="text-lg font-bold text-card-foreground">{helpers.formatMoney(calcResult.base)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Comissão</div>
                  <div className="text-lg font-bold text-destructive">{helpers.formatMoney(calcResult.commissionValue)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Preço Final</div>
                  <div className="text-lg font-bold text-chart-1">{helpers.formatMoney(calcResult.finalPrice)}</div>
                </div>
              </div>
            )}
          </div>
        );

      case 'bio':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Nome</label>
                <input value={bioNome} onChange={e => setBioNome(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Seu Nome" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Área</label>
                <input value={bioArea} onChange={e => setBioArea(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Marketing Digital" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-card-foreground mb-1">Descrição</label>
                <input value={bioDescricao} onChange={e => setBioDescricao(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Especialista em vendas online" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Contato</label>
                <input value={bioContato} onChange={e => setBioContato(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="@seucontato" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Cargo (opcional)</label>
                <input value={bioCargo} onChange={e => setBioCargo(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="CEO" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Empresa (opcional)</label>
                <input value={bioEmpresa} onChange={e => setBioEmpresa(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Hive Content" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Estilo de Emojis</label>
                <select value={bioEmojiPack} onChange={e => setBioEmojiPack(parseInt(e.target.value))} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                  {EMOJI_PACKS.map((p, i) => <option key={i} value={i}>{p.name} {p.emojis.split(' ').slice(0, 3).join(' ')}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-card-foreground mb-1">Template</label>
                <select value={bioTemplate} onChange={e => setBioTemplate(parseInt(e.target.value))} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                  {BIO_TEMPLATES.map((t, i) => <option key={i} value={i}>Template {i + 1}</option>)}
                </select>
              </div>
            </div>
            <AnimatedButton onClick={handleGenerateBio} className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg">Gerar Bio</AnimatedButton>
            {bioResult && (
              <div className="p-4 bg-background rounded-xl border border-border">
                <div className="flex items-start justify-between gap-2">
                  <pre className="text-sm text-card-foreground whitespace-pre-wrap font-sans">{bioResult}</pre>
                  <button onClick={() => copyToClipboard(bioResult, 'bio')} className="p-2 shrink-0 hover:bg-secondary rounded-lg transition-colors">
                    {copiedId === 'bio' ? <Check size={16} className="text-chart-1" /> : <Copy size={16} className="text-muted-foreground" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'verificador':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">URL para verificar</label>
              <input value={checkUrl} onChange={e => setCheckUrl(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="https://exemplo.com" />
            </div>
            <AnimatedButton onClick={handleCheckLink} disabled={checkLoading || !checkUrl} className="px-5 py-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold rounded-lg flex items-center gap-2">
              {checkLoading && <Loader2 size={16} className="animate-spin" />}
              {checkLoading ? 'Verificando...' : 'Verificar'}
            </AnimatedButton>
            {checkResult && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${checkResult.accessible ? 'bg-chart-1/10 border-chart-1/30 text-chart-1' : 'bg-destructive/10 border-destructive/30 text-destructive'}`}>
                {checkResult.accessible ? <CheckCircle size={20} className="shrink-0" /> : <Link size={20} className="shrink-0" />}
                <div>
                  <p className="font-medium">{checkResult.message}</p>
                  {checkResult.status > 0 && <p className="text-xs opacity-80 mt-1">Código HTTP: {checkResult.status}</p>}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Ferramentas</h1>
            <p className="text-sm text-muted-foreground mt-1">Utilitários e ferramentas auxiliares</p>
          </div>
        </div>

        {!activeTool ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOLS.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <div key={tool.key} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <button onClick={() => setActiveTool(tool.key)} className="w-full text-left">
                    <AnimatedCard className="bg-card rounded-xl border border-border p-6 h-full hover:border-primary/30 transition-all">
                      <Icon size={28} className="text-primary mb-3" />
                      <h3 className="font-bold text-card-foreground mb-1">{tool.title}</h3>
                      <p className="text-sm text-muted-foreground">{tool.desc}</p>
                    </AnimatedCard>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="animate-fade-in">
            <AnimatedCard className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-card-foreground">{TOOLS.find(t => t.key === activeTool)?.title}</h2>
                <button onClick={() => setActiveTool(null)} className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors">Voltar</button>
              </div>
              {renderToolContent()}
            </AnimatedCard>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default Ferramentas;
