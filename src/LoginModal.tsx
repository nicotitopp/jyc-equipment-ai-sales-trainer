import React, { useState } from 'react';
import { User } from './types';
import { Lock, User as UserIcon, LogIn, Eye, EyeOff, Loader2, ShieldCheck, Shield, Radio, Key } from 'lucide-react';

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
      setError('Por favor ingresa tu identificador de usuario.');
      return;
    }

    if (!password.trim()) {
      setError('Por favor ingresa tu código de acceso.');
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
        throw new Error(data.error || 'Credenciales no autorizadas en el sistema central.');
      }

      await new Promise(r => setTimeout(r, 300));
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'Fallo de enlace con la base de datos central.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#040609]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0A0F17] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-[#1E293B] max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header HUD Branding */}
        <div className="bg-[#080C14] pt-8 pb-6 px-8 text-slate-100 text-center relative border-b border-[#1E293B]">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-[0_0_20px_rgba(6,182,212,0.3)] font-mono font-extrabold text-white text-xl border border-cyan-400/40">
            JYC
          </div>
          <h2 className="text-base sm:text-lg font-mono font-bold tracking-wider text-slate-100 uppercase">
            JYC EQUIPMENT COCKPIT
          </h2>
          <p className="text-cyan-400 text-xs font-mono mt-0.5 tracking-wider uppercase flex items-center justify-center gap-1.5">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>AI Sales Training & Intelligence System</span>
          </p>
        </div>

        {/* Login Form */}
        <div className="p-7 space-y-5 text-left relative z-10">
          <div className="space-y-1">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              Autenticación de Operador
            </h3>
            <p className="text-xs font-mono text-slate-400">Ingresa tus credenciales autorizadas para desbloquear la consola.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Input */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1 tracking-wider uppercase">
                Usuario / Clearance ID
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="admin o identificador asignado"
                  autoComplete="username"
                  disabled={loading}
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm font-mono border border-[#1E293B] rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 bg-[#080C14] text-slate-100 placeholder-slate-600 transition-all disabled:opacity-60"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1 tracking-wider uppercase">
                Código de Acceso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
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
                  className="w-full pl-10 pr-11 py-2.5 text-xs sm:text-sm font-mono border border-[#1E293B] rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 bg-[#080C14] text-slate-100 placeholder-slate-600 transition-all disabled:opacity-60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-red-300 text-xs font-mono animate-in fade-in duration-150">
                {error}
              </div>
            )}

            {/* Submit Button with Loading State */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.99] text-white rounded-xl font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando con PostgreSQL...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>INGRESAR A LA CONSOLA</span>
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Footer Note */}
          <div className="pt-3 border-t border-[#1E293B] flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ENLACE PERSISTENTE CIFRADO // NEON POSTGRESQL</span>
          </div>

        </div>

      </div>
    </div>
  );
}