import React from 'react';
import { PageTransition, GlassCard } from '../components/ui/AnimatedContainer';
import { GraduationCap, Play, Lock } from 'lucide-react';

const aulas = [
  { title: 'Introdução ao Painel', desc: 'Conheça todas as funcionalidades do Zeze Painel', free: true, duration: '5 min' },
  { title: 'Configurando seu primeiro Bot', desc: 'Aprenda a criar e configurar bots do zero', free: true, duration: '12 min' },
  { title: 'Integrando Gateways de Pagamento', desc: 'Conecte os principais gateways PIX', free: false, duration: '15 min' },
  { title: 'Criando Fluxos de Automação', desc: 'Domine o construtor visual de fluxos', free: false, duration: '20 min' },
  { title: 'Remarketing e Conversão', desc: 'Estratégias para aumentar suas vendas', free: false, duration: '18 min' },
  { title: 'Análises e Métricas', desc: 'Interpretando dados para escalar', free: false, duration: '10 min' },
];

function Aulas() {
  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-white font-bold">Aulas</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">Treinamentos e conteúdos educativos</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {aulas.map((aula, i) => (
            <GlassCard key={i} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  {aula.free ? <Play size={18} className="text-[var(--brand-500)]" /> : <Lock size={18} className="text-[#a1a1aa]" />}
                </div>
                <div>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${aula.free ? 'bg-[var(--brand-500)]/20 text-[var(--brand-500)]' : 'bg-white/[0.06] text-[#a1a1aa]'}`}>
                    {aula.free ? 'Grátis' : 'Premium'}
                  </span>
                </div>
              </div>
              <h3 className="text-white font-semibold mb-1">{aula.title}</h3>
              <p className="text-sm text-[#a1a1aa] mb-4">{aula.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#52525b]">{aula.duration}</span>
                <button className="text-xs font-medium text-[var(--brand-500)] hover:text-[var(--brand-400)] transition-colors">
                  {aula.free ? 'Assistir' : 'Desbloquear'}
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}

export default Aulas;
