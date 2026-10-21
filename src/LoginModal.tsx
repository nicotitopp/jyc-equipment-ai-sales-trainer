import React, { useState } from 'react';
import { User } from './types';
import { Lock, User as UserIcon, LogIn, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

interface LoginModalProps {
  onLogin: (user: User) => void;
}

export default function LoginModal({ onLogin }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Ingresa tu nombre de usuario.');
      return;
    }

    if (!password.trim()) {
      setError('Ingresa tu contraseña.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Usuario o contraseña incorrectos.');
      }

      await new Promise(r => setTimeout(r, 250));
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
        
        {/* Brand Header */}
        <div className="bg-[#0F172A] pt-7 pb-6 px-8 text-white text-center border-b border-slate-800">
          <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center mx-auto mb-3 font-display font-bold text-lg shadow-xs">
            JYC
          </div>
          <h2 className="text-lg font-display font-bold tracking-tight text-white">
            JYC Equipment
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Entrenamiento comercial y simulación de llamadas
          </p>
        </div>

        {/* Form */}
        <div className="p-7 space-y-5 text-left">
          <div className="space-y-1">
            <h3 className="text-base font-display font-bold text-slate-900">Iniciar sesión</h3>
            <p className="text-xs text-slate-500">Ingresa con tu cuenta de comercial o supervisor.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Usuario
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Tu usuario asignado"
                  autoComplete="username"
                  disabled={loading}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 bg-slate-50 focus:bg-white text-slate-900 transition-colors disabled:opacity-60"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full pl-10 pr-11 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 bg-slate-50 focus:bg-white text-slate-900 transition-colors disabled:opacity-60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando acceso...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Entrar a la plataforma</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Plataforma interna de entrenamiento comercial JYC</span>
          </div>
        </div>

      </div>
    </div>
  );
}
