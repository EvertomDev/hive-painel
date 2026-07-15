import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { PlatformIcon, getPlatformMeta } from './PlatformIcon';
import { X, Camera } from 'lucide-react';

const platforms = ['telegram', 'whatsapp', 'discord', 'instagram', 'facebook', 'x'];
const statuses = ['online', 'offline', 'connecting'];

export function AccountModal({ account, onClose }) {
  const { state, dispatch, helpers, addActivity, addNotification } = useApp();
  const editing = !!account;

  const [form, setForm] = useState({
    name: '',
    platform: 'telegram',
    identifier: '',
    photo: '',
    status: 'offline',
    tags: [],
    category: 'Suporte',
    notes: '',
    favorite: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    if (account) {
      setForm({
        name: account.name || '',
        platform: account.platform || 'telegram',
        identifier: account.identifier || '',
        photo: account.photo || '',
        status: account.status || 'offline',
        tags: account.tags || [],
        category: account.category || 'Suporte',
        notes: account.notes || '',
        favorite: account.favorite || false,
      });
      setPhotoPreview(account.photo || '');
    }
  }, [account]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setPhotoPreview(base64);
      setForm({ ...form, photo: base64 });
    };
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t || form.tags.includes(t)) return;
    setForm({ ...form, tags: [...form.tags, t] });
    setTagInput('');
  };

  const removeTag = (t) => {
    setForm({ ...form, tags: form.tags.filter(tag => tag !== t) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.identifier) return;

    const data = {
      ...form,
      tags: form.tags,
    };

    if (editing) {
      dispatch({ type: 'UPDATE_ACCOUNT', payload: { id: account.id, data } });
      addActivity(`Conta ${form.name} atualizada`, 'info');
    } else {
      dispatch({ type: 'ADD_ACCOUNT', payload: { id: helpers.uid(), ...data, createdAt: helpers.today() } });
      addActivity(`Conta ${form.name} adicionada`, 'success');
      addNotification('Conta integrada', `${form.name} foi adicionada às contas.`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-card-foreground">{editing ? 'Editar Conta' : 'Adicionar Conta'}</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <PlatformIcon platform={form.platform} size={28} />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                <Camera size={12} />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-card-foreground mb-1">Nome da conta</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" placeholder="Ex: Suporte Principal" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">Plataforma</label>
              <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all">
                {platforms.map(p => <option key={p} value={p}>{getPlatformMeta(p).label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all">
                {statuses.map(s => <option key={s} value={s}>{s === 'online' ? 'Online' : s === 'offline' ? 'Offline' : 'Conectando'}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">Número ou usuário</label>
            <input value={form.identifier} onChange={e => setForm({ ...form, identifier: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" placeholder="@usuario ou +55 11 99999-9999" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">Categoria</label>
            <input list="categories" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" placeholder="Ex: Suporte" />
            <datalist id="categories">
              {state.accountCategories.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1 px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" placeholder="Digite uma tag e pressione Enter" />
              <button type="button" onClick={addTag} className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-sm font-medium transition-colors">Adicionar</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-foreground">×</button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">Observações</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all resize-none" placeholder="Notas sobre a conta..." />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="favorite" checked={form.favorite} onChange={e => setForm({ ...form, favorite: e.target.checked })} className="w-4 h-4 rounded border-border text-primary focus:ring-ring" />
            <label htmlFor="favorite" className="text-sm text-card-foreground">Adicionar aos favoritos</label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
            <button type="submit" className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]">{editing ? 'Salvar' : 'Adicionar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
