import React from 'react';
import { PageTransition, GlassCard } from '../components/ui/AnimatedContainer';
import { Send, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';

function Postagens() {
  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl text-white font-bold">Postagens</h1>
            <p className="text-sm text-[#a1a1aa] mt-1">Disparos em massa e agendamentos</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-sm font-semibold rounded-xl transition-all hover:scale-[1.02]">
            <Plus size={16} /> Nova Postagem
          </button>
        </div>

        <div className="space-y-3">
          {[
            { title: 'Promoção de Julho', status: 'Enviado', date: '15/07/2026', recipients: 1247, icon: CheckCircle, color: 'text-emerald-400' },
            { title: 'Novidades da Semana', status: 'Agendado', date: '18/07/2026 10:00', recipients: 0, icon: Clock, color: 'text-[var(--brand-500)]' },
            { title: 'Lembrete de Pagamento', status: 'Rascunho', date: '—', recipients: 0, icon: AlertCircle, color: 'text-[#a1a1aa]' },
          ].map((post, i) => (
            <GlassCard key={i} className="flex items-center gap-4 p-4" hover={false}>
              <div className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 ${post.color}`}>
                <post.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{post.title}</p>
                <p className="text-xs text-[#a1a1aa]">{post.date}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  post.status === 'Enviado' ? 'bg-emerald-500/20 text-emerald-400' :
                  post.status === 'Agendado' ? 'bg-[var(--brand-500)]/20 text-[var(--brand-500)]' :
                  'bg-white/[0.06] text-[#a1a1aa]'
                }`}>{post.status}</span>
                {post.recipients > 0 && <p className="text-xs text-[#52525b] mt-1">{post.recipients} recipients</p>}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}

export default Postagens;
