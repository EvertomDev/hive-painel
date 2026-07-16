import React from 'react';
import { PageTransition, GlassCard } from '../components/ui/AnimatedContainer';
import { Layers, Plus } from 'lucide-react';

function Stories() {
  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl text-white font-bold">Stories</h1>
            <p className="text-sm text-[#a1a1aa] mt-1">Gerencie seus stories e conteúdos</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-sm font-semibold rounded-xl transition-all hover:scale-[1.02]">
            <Plus size={16} /> Novo Story
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <GlassCard key={i} className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                <Layers size={28} className="text-[#a1a1aa]" />
              </div>
              <p className="text-sm font-medium text-white">Story {i}</p>
              <p className="text-xs text-[#a1a1aa] mt-1">Clique para gerenciar</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}

export default Stories;
