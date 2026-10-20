import React from 'react';
import { User as UserType, Mode } from '../types';
import { Menu, User, Shield, Volume2, VolumeX, LogOut } from 'lucide-react';

interface HeaderProps {
  mode: Mode;
  currentUser: UserType | null;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onOpenSidebar: () => void;
  onLogout: () => void;
  modeDescription: string;
}

export default function Header({
  mode,
  currentUser,
  voiceEnabled,
  onToggleVoice,
  onOpenSidebar,
  onLogout,
  modeDescription,
}: HeaderProps) {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 shadow-xs z-10">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
              {mode}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
              JYC v2.0
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate hidden md:block">
            {modeDescription}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {currentUser && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              isAdmin
                ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            {isAdmin ? (
              <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            ) : (
              <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            )}
            <span className="max-w-[120px] sm:max-w-[160px] truncate">
              {currentUser.name}
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                isAdmin
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isAdmin ? 'ADMIN' : 'VENDEDOR'}
            </span>
          </div>
        )}

        {/* Voice synthesis toggle */}
        <button
          onClick={onToggleVoice}
          title={voiceEnabled ? 'Desactivar voz de respuesta' : 'Activar voz de respuesta'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
            voiceEnabled
              ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          {voiceEnabled ? (
            <Volume2 className="w-4 h-4 text-blue-600" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
          <span className="hidden lg:inline">{voiceEnabled ? 'Voz Activa' : 'Voz Silenciada'}</span>
        </button>

        {/* User logout / switch */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer hover:border-slate-300"
          title="Cambiar o cerrar sesión de usuario"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
