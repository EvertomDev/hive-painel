import React, { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('admin@hive.com.br');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Preencha email e senha.');
      return;
    }
    localStorage.setItem('hive-auth', JSON.stringify({ email, loggedAt: new Date().toISOString() }));
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo/hive-login.png" alt="Hive" className="h-14 hover:scale-105 transition-transform" />
          <span className="text-3xl font-bold text-foreground">Hive</span>
        </div>
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          <h1 className="text-xl font-bold text-card-foreground mb-1">Bem-vindo de volta</h1>
          <p className="text-sm text-muted-foreground mb-6">Entre para gerenciar seus bots e vendas</p>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm animate-fade-in">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
