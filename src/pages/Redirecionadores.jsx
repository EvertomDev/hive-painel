import React from 'react';
import { PageTransition, GlassCard } from '../components/ui/AnimatedContainer';
import { Link2, Plus, BarChart3 } from 'lucide-react';

function Redirecionadores() {
  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl text-white font-bold">Redirecionadores</h1>
            <p className="text-sm text-[#a1a1aa] mt-1">Links curtos e rastreáveis</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-sm font-semibold rounded-xl transition-all hover:scale-[1.02]">
            <Plus size={16} /> Novo Link
          </button>
        </div>

        <div className="space-y-3">
          {[
            { name: 'meu-link', clicks: 1254, url: 'https://t.me/meucanal' },
            { name: 'promo-julho', clicks: 843, url: 'https://t.me/promocao' },
            { name: 'vip-acesso', clicks: 567, url: 'https://t.me/vipgroup' },
          ].map((link, i) => (
            <GlassCard key={i} className="flex items-center gap-4 p-4" hover={false}>
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                <Link2 size={18} className="text-[var(--brand-500)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">/{link.name}</p>
                <p className="text-xs text-[#a1a1aa] truncate">{link.url}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                <BarChart3 size={14} />
                <span>{link.clicks} cliques</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}

export default Redirecionadores;
