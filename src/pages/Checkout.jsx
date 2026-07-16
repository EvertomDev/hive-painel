import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';
import { ShoppingCart, CreditCard, Copy, Check, QrCode, Settings, History, Trash2, Palette, Image, Type } from 'lucide-react';

const STORAGE_KEY_CONFIG = 'hive-checkout-config';
const STORAGE_KEY_TX = 'hive-checkout-tx';

function loadConfig() {
  try { const raw = localStorage.getItem(STORAGE_KEY_CONFIG); return raw ? JSON.parse(raw) : { primaryColor: '#7C3AED', logoUrl: '', welcomeText: 'Finalize sua compra', footerText: 'Hive Content © 2025 - Todos os direitos reservados' }; } catch { return {}; }
}

function loadTx() {
  try { const raw = localStorage.getItem(STORAGE_KEY_TX); return raw ? JSON.parse(raw) : []; } catch { return []; }
}

function Checkout() {
  const { addActivity, helpers } = useApp();
  const [productName, setProductName] = useState('Meu Produto Digital');
  const [productPrice, setProductPrice] = useState('29.90');
  const [config, setConfig] = useState(loadConfig);
  const [transactions, setTransactions] = useState(loadTx);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config)); }, [config]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions)); }, [transactions]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfigChange = (key, value) => {
    setConfig({ ...config, [key]: value });
  };

  const simulatePayment = () => {
    const tx = { id: helpers.uid(), product: productName, price: productPrice, status: 'Aprovado', method: 'PIX', createdAt: new Date().toISOString(), customer: 'cliente@email.com' };
    setTransactions([tx, ...transactions]);
    addActivity(`Pagamento de R$ ${productPrice} registrado`, 'success');
  };

  const pixCode = `00020101021226880014BR.GOV.BCB.PIX0136${config.pixKey || 'hive@pix.com'}0208HiveContent5204000053039865406${parseFloat(productPrice || 0).toFixed(2).replace('.', '')}5802BR5925${config.merchantName || 'Hive Content'}6008BRASILIA62070503***6304`;

  const handleDeleteTx = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Checkout</h1>
            <p className="text-sm text-muted-foreground mt-1">Página de pagamento</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Section */}
          <div>
            <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2 mb-4"><ShoppingCart size={20} className="text-primary" /> Pré-visualização</h2>
            <AnimatedCard className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-6" style={{ borderBottom: `3px solid ${config.primaryColor}` }}>
                {config.logoUrl && (
                  <div className="flex justify-center mb-4">
                    <img src={config.logoUrl} alt="Logo" className="h-12 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-1">{config.welcomeText || 'Finalize sua compra'}</p>
                  <h3 className="text-xl font-bold text-card-foreground">{productName}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold" style={{ color: config.primaryColor }}>
                      R$ {parseFloat(productPrice || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 p-6 bg-background rounded-xl border border-border">
                  <div className="w-48 h-48 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
                    <QrCode size={80} className="text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Escaneie o QR Code acima com seu banco ou copie o código PIX abaixo</p>
                  <div className="w-full flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <code className="flex-1 text-xs font-mono text-card-foreground truncate">{pixCode}</code>
                    <button onClick={() => copyToClipboard(pixCode, 'pix-code')} className="p-1.5 hover:bg-secondary rounded transition-colors shrink-0">
                      {copiedId === 'pix-code' ? <Check size={16} className="text-chart-1" /> : <Copy size={16} className="text-muted-foreground" />}
                    </button>
                  </div>
                  <AnimatedButton onClick={simulatePayment} className="w-full py-3 font-semibold text-white rounded-lg" style={{ backgroundColor: config.primaryColor }}>
                    Pagar com PIX
                  </AnimatedButton>
                </div>

                <div className="mt-6 text-center text-xs text-muted-foreground">
                  <p>Instruções de pagamento:</p>
                  <p className="mt-1">1. Abra o app do seu banco</p>
                  <p>2. Escolha pagar via PIX</p>
                  <p>3. Escaneie o QR Code ou copie o código</p>
                  <p>4. Confirme o pagamento</p>
                </div>
              </div>
              {config.footerText && (
                <div className="px-6 py-3 bg-muted text-center text-xs text-muted-foreground">{config.footerText}</div>
              )}
            </AnimatedCard>
          </div>

          {/* Settings & History */}
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2 mb-4"><Settings size={20} className="text-primary" /> Personalização</h2>
              <AnimatedCard className="bg-card rounded-xl border border-border p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-1">Produto</label>
                      <input value={productName} onChange={e => setProductName(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-medium text-card-foreground mb-1">Preço (R$)</label>
                      <input type="number" step="0.01" min="0" value={productPrice} onChange={e => setProductPrice(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1 flex items-center gap-2"><Palette size={14} /> Cor primária</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={config.primaryColor} onChange={e => handleConfigChange('primaryColor', e.target.value)} className="w-12 h-10 rounded-lg border border-input cursor-pointer bg-transparent" />
                      <input value={config.primaryColor} onChange={e => handleConfigChange('primaryColor', e.target.value)} className="flex-1 px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none font-mono text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1 flex items-center gap-2"><Image size={14} /> URL do Logo</label>
                    <input value={config.logoUrl} onChange={e => handleConfigChange('logoUrl', e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="https://seusite.com/logo.png" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1 flex items-center gap-2"><Type size={14} /> Texto de boas-vindas</label>
                    <input value={config.welcomeText} onChange={e => handleConfigChange('welcomeText', e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Texto do rodapé</label>
                    <input value={config.footerText} onChange={e => handleConfigChange('footerText', e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
                  </div>
                </div>
              </AnimatedCard>
            </section>

            <section>
              <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2 mb-4"><History size={20} className="text-primary" /> Histórico de Transações</h2>
              {transactions.length === 0 ? (
                <AnimatedCard className="bg-card rounded-xl border border-border p-8 text-center">
                  <CreditCard size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Nenhuma transação registrada.</p>
                </AnimatedCard>
              ) : (
                <div className="space-y-2">
                  {transactions.map((t, i) => (
                    <div key={t.id} className="bg-card rounded-xl border border-border p-4 animate-fade-in flex items-start justify-between gap-3" style={{ animationDelay: `${i * 30}ms` }}>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{t.product}</p>
                        <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString('pt-BR')} &middot; {t.customer}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-card-foreground">R$ {parseFloat(t.price).toFixed(2)}</span>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${t.status === 'Aprovado' ? 'bg-chart-1/15 text-chart-1' : 'bg-chart-4/15 text-chart-4'}`}>{t.status}</span>
                          <span className="text-xs text-muted-foreground">{t.method}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteTx(t.id)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors shrink-0"><Trash2 size={14} className="text-destructive" /></button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Checkout;
