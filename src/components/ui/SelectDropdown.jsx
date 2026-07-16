import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function SelectDropdown({ options, value, onChange, placeholder, icon: Icon, disabled, searchable }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);
  const filtered = searchable && search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()) || (o.description || '').toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => !disabled && setOpen(!open)} disabled={disabled}
        className={cn(
          'w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl border transition-all text-left',
          open ? 'border-[var(--brand-500)] ring-1 ring-[var(--brand-500)]' : 'border-white/[0.08]',
          disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-white/[0.12] cursor-pointer',
          selected ? 'text-white' : 'text-[#52525b]',
          'bg-white/[0.04]'
        )}>
        {Icon && <Icon size={15} className="text-[#52525b] shrink-0" />}
        <span className="flex-1 truncate">{selected ? selected.label : (placeholder || 'Selecione...')}</span>
        <ChevronDown size={14} className={cn('text-[#52525b] transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-white/[0.08] bg-[#1a1a22] shadow-xl shadow-black/40 overflow-hidden animate-fade-in">
          {searchable && (
            <div className="relative p-2 border-b border-white/[0.06]">
              <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525b]" />
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar..."
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-white/[0.04] border border-white/[0.06] text-white placeholder-[#52525b] outline-none focus:ring-1 focus:ring-[var(--brand-500)]" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-white"><X size={12} /></button>}
            </div>
          )}
          <div className="max-h-52 overflow-y-auto scrollbar-none p-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-[#52525b]">Nenhum resultado</div>
            ) : (
              filtered.map((opt) => (
                <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); setSearch(''); }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-colors',
                    opt.value === value ? 'bg-[var(--brand-500)]/10 text-[var(--brand-500)]' : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
                  )}>
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{opt.label}</div>
                    {opt.description && <div className="text-[10px] text-[#52525b] truncate">{opt.description}</div>}
                  </div>
                  {opt.badge && <span className="shrink-0 px-1.5 py-0.5 text-[10px] rounded-full bg-white/[0.06] text-[#52525b]">{opt.badge}</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
