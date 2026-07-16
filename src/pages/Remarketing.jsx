import React from 'react';
import { PageTransition, GlassCard } from '../components/ui/AnimatedContainer';
import { Mailbox, Plus, Users, Send } from 'lucide-react';

function Remarketing() {
  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl text-white font-bold">Remarketing</h1>
            <p className="text-sm text-[#a1a1aa] mt-1">Campanhas automáticas de recuperação</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-sm font-semibold rounded-xl transition-all hover:scale-[1.02]">
            <Plus size={16} /> Nova Campanha
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <GlassCard>
            <div className="flex items-center gap-3 mb-3">
              <Users size={20} className="text-[var(--brand-500)]" />
              <span className="text-xs text-[#a1a1aa]">Público Total</span>
            </div>
            <div className="text-2xl font-bold text-white">1.247</div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-3 mb-3">
              <Send size={20} className="text-[var(--brand-500)]" />
              <span className="text-xs text-[#a1a1aa]">Disparos Hoje</span>
            </div>
            <div className="text-2xl font-bold text-white">342</div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-3 mb-3">
              <Mailbox size={20} className="text-[var(--brand-500)]" />
              <span className="text-xs text-[#a1a1aa]">Conversão</span>
            </div>
            <div className="text-2xl font-bold text-white">12.4%</div>
          </GlassCard>
        </div>

        <div className="space-y-3">
          {[
            { name: 'Abandono de Carrinho', audience: '483 leads', status: 'Ativo', conv: '8.2%' },
            { name: 'PIX Não Confirmado', audience: '217 leads', status: 'Ativo', conv: '15.7%' },
            { name: 'Reativação Inativos', audience: '1.2k leads', status: 'Pausado', conv: '—' },
          ].map((camp, i) => (
            <GlassCard key={i} className="flex items-center gap-4 p-4" hover={false}>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{camp.name}</p>
                <p className="text-xs text-[#a1a1aa]">{camp.audience}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${camp.status === 'Ativo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.06] text-[#a1a1aa]'}`}>
                {camp.status}
              </span>
              {camp.conv !== '—' && <span className="text-sm text-white font-medium">{camp.conv}</span>}
            </GlassCard>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}

export default Remarketing;
