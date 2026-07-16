import React, { useState } from 'react';
import { PageTransition, GlassCard } from '../components/ui/AnimatedContainer';
import { Dice5, Sparkles, Gift, ArrowRight } from 'lucide-react';

function RoletaHot() {
  const [spinning, setSpinning] = useState(false);

  const handleSpin = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 3000);
  };

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-white font-bold">Roleta Hot</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">Gamificação para engajar leads</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard className="flex flex-col items-center justify-center py-16">
            <div className={`relative w-40 h-40 rounded-full border-2 border-white/[0.08] flex items-center justify-center mb-6 transition-all duration-300 ${spinning ? 'animate-spin' : ''}`}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--brand-500)]/20 via-transparent to-amber-500/20"></div>
              <Dice5 size={48} className={`text-[var(--brand-500)] transition-all duration-300 ${spinning ? 'scale-110' : ''}`} />
            </div>
            <button
              onClick={handleSpin}
              disabled={spinning}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--brand-500)] to-[var(--brand-600)] text-white font-semibold rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={18} />
              {spinning ? 'Girando...' : 'Girar Roleta'}
            </button>
          </GlassCard>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Prêmios</h2>
            {[
              { prize: '10% de desconto', prob: '30%', icon: Gift },
              { prize: '20% de desconto', prob: '20%', icon: Gift },
              { prize: 'Tente novamente', prob: '40%', icon: ArrowRight },
              { prize: 'Acesso VIP grátis', prob: '10%', icon: Sparkles },
            ].map((p, i) => (
              <GlassCard key={i} className="flex items-center gap-4 p-4" hover={false}>
                <p.icon size={18} className="text-[var(--brand-500)]" />
                <span className="flex-1 text-sm text-white">{p.prize}</span>
                <span className="text-xs text-[#a1a1aa]">{p.prob}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default RoletaHot;
