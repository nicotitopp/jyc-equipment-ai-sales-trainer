import React from 'react';
import { User as UserType, Mode } from '../types';
import { Menu, User, Shield, Volume2, VolumeX, LogOut, Radio } from 'lucide-react';

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

  // Status indicator colors
  const modeLedColor = 
    mode === 'Live Call Simulation' ? 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]' :
    mode === 'Coach' ? 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]' :
    mode === 'Real Call Audit' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]' :
    'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]';

  const modeCode = 
    mode === 'Live Call Simulation' ? 'MOD-01 // TELEPHONY' :
    mode === 'Coach' ? 'MOD-02 // PLAYBOOK' :
    mode === 'Real Call Audit' ? 'MOD-03 // FORENSIC' :
    'MOD-04 // TELEMETRY';

  return (
    <header className="bg-[#0A0E15] border-b border-[#1A2332] px-4 sm:px-6 py-2.5 flex items-center justify-between shrink-0 z-20 select-none">
      
      {/* Left: Mobile Toggle + Station Telemetry */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          aria-label="Abrir terminal de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full ${modeLedColor} animate-pulse`} />
            <h1 className="text-sm sm:text-base font-bold font-display text-white tracking-tight truncate uppercase">
              {mode}
            </h1>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider bg-[#121924] text-slate-400 border border-[#232f41]">
              {modeCode}
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 truncate hidden md:block">
            {modeDescription}
          </p>
        </div>
      </div>

      {/* Right: Operator Badge + Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {currentUser && (
          <div
            className={`flex items-center gap-2 px-2.5 py-1 rounded bg-[#0F141C] border ${
              isAdmin
                ? 'border-indigo-500/40 text-indigo-300'
                : 'border-slate-800 text-slate-300'
            }`}
          >
            {isAdmin ? (
              <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            ) : (
              <User className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            )}
            <span className="text-xs font-semibold max-w-[110px] sm:max-w-[150px] truncate text-slate-200">
              {currentUser.name}
            </span>
            <span
              className={`text-[9px] px-1 py-0.5 rounded font-mono font-bold tracking-wider ${
                isAdmin
                  ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isAdmin ? 'ADMIN' : 'OP'}
            </span>
          </div>
        )}

        {/* Audio Output Toggle */}
        <button
          onClick={onToggleVoice}
          title={voiceEnabled ? 'Desactivar síntesis por voz' : 'Activar síntesis por voz'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono transition-all cursor-pointer ${
            voiceEnabled
              ? 'bg-sky-950/60 border-sky-500/50 text-sky-300 hover:bg-sky-900/60'
              : 'bg-[#0F141C] border-[#1C2634] text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          {voiceEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-sky-400" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span className="hidden lg:inline text-[11px] font-semibold">
            {voiceEnabled ? 'VOZ: ON' : 'VOZ: MUTE'}
          </span>
        </button>

        {/* Logout / Switch Terminal */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#1C2634] bg-[#0F141C] hover:bg-red-950/30 hover:border-red-800/50 hover:text-red-300 text-slate-400 text-xs font-mono transition-all cursor-pointer"
          title="Cerrar sesión de terminal"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">SALIR</span>
        </button>
      </div>
    </header>
  );
}
