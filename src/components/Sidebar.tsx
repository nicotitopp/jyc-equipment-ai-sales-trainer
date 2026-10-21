import React from 'react';
import { Mode, User as UserType } from '../types';
import { 
  GraduationCap, PhoneCall, UploadCloud, BarChart3, 
  RefreshCw, X, Shield, User, LogOut, Radio, Terminal, Cpu
} from 'lucide-react';

interface SidebarProps {
  currentMode: Mode;
  onSelectMode: (mode: Mode) => void;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onLogout: () => void;
  onResetCoach: () => void;
}

export const MODES_LIST: { 
  id: Mode; 
  channel: string;
  label: string; 
  badge: string;
  icon: React.ComponentType<{ className?: string }>; 
  description: string;
  accentClass: string;
  activeBorder: string;
}[] = [
  { 
    id: 'Coach', 
    channel: 'CH-01',
    label: 'Coach & Playbook', 
    badge: 'AI GUIDANCE',
    icon: GraduationCap, 
    description: 'Guión por industria, objeciones y catálogo de maquinaria',
    accentClass: 'text-sky-400 bg-sky-950/40 border-sky-500/40',
    activeBorder: 'border-l-sky-500 bg-[#0E1521]'
  },
  { 
    id: 'Live Call Simulation', 
    channel: 'CH-02',
    label: 'Simulación Telefónica', 
    badge: 'LIVE VOX',
    icon: PhoneCall, 
    description: 'Llamada de voz en tiempo real con comprador prospecto',
    accentClass: 'text-amber-400 bg-amber-950/40 border-amber-500/40',
    activeBorder: 'border-l-amber-500 bg-[#171410]'
  },
  { 
    id: 'Real Call Audit', 
    channel: 'CH-03',
    label: 'Auditoría Forense', 
    badge: 'GEMINI 2.5',
    icon: UploadCloud, 
    description: 'Sube audio real y recibe dictamen de cumplimiento de guión',
    accentClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40',
    activeBorder: 'border-l-emerald-500 bg-[#0D1815]'
  },
  { 
    id: 'History', 
    channel: 'CH-04',
    label: 'Métricas & Operaciones', 
    badge: 'NEON DB',
    icon: BarChart3, 
    description: 'Tablero de desempeño comercial, grabaciones y KPIs',
    accentClass: 'text-indigo-400 bg-indigo-950/40 border-indigo-500/40',
    activeBorder: 'border-l-indigo-500 bg-[#121422]'
  },
];

export default function Sidebar({
  currentMode,
  onSelectMode,
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onResetCoach,
}: SidebarProps) {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#040608]/80 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Rail */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#070A0F] text-slate-100 flex flex-col border-r border-[#151D29] transform transition-transform duration-200 ease-out md:relative md:translate-x-0 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Terminal Header */}
        <div className="p-4 border-b border-[#151D29] flex items-center justify-between bg-[#090D14]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-gradient-to-br from-blue-700 to-indigo-900 border border-blue-400/40 flex items-center justify-center font-display font-black text-white text-base tracking-wider shadow-inner">
              JYC
            </div>
            <div>
              <div className="font-extrabold text-xs font-display tracking-wider text-white uppercase flex items-center gap-1.5">
                JYC EQUIPMENT
              </div>
              <div className="text-[10px] font-mono text-slate-400 tracking-wider flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACQUISITIONS TERMINAL
              </div>
            </div>
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
            onClick={onClose}
            aria-label="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Industrial Channel Matrix */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold px-2 mb-2 flex items-center justify-between">
              <span>CANALES OPERATIVOS</span>
              <Terminal className="w-3 h-3 text-slate-500" />
            </div>

            <nav className="space-y-1.5" aria-label="Canales principales">
              {MODES_LIST.map((item) => {
                const Icon = item.icon;
                const isActive = currentMode === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectMode(item.id);
                      onClose();
                    }}
                    className={`w-full text-left p-2.5 rounded transition-all cursor-pointer border ${
                      isActive
                        ? `${item.activeBorder} border-r-[#1C2634] border-y-[#1C2634] border-l-4 text-white shadow-md`
                        : 'border-[#121924] bg-[#0A0E15]/60 hover:bg-[#0F1520] hover:border-[#1E293B] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider">
                        {item.channel}
                      </span>
                      <span className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded border ${
                        isActive ? item.accentClass : 'border-[#1C2634] text-slate-400 bg-[#0D121B]'
                      }`}>
                        {item.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold tracking-tight text-white font-display">
                        {item.label}
                      </span>
                    </div>

                    <p className={`text-[11px] leading-tight mt-1 line-clamp-1 ${
                      isActive ? 'text-slate-300' : 'text-slate-400'
                    }`}>
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Action: Reset Conversation */}
          <div className="pt-2 border-t border-[#151D29]">
            <button
              onClick={onResetCoach}
              disabled={currentMode !== 'Coach'}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded border border-[#1C2634] bg-[#0A0E15] hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Reinicia la conversación del entrenador"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>REINICIAR DIÁLOGO</span>
            </button>
          </div>
        </div>

        {/* Operator Profile Dossier & Console Info */}
        <div className="p-3 border-t border-[#151D29] bg-[#090D14]">
          {currentUser && (
            <div className="bg-[#0B1017] border border-[#1A2332] rounded p-2.5 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-slate-500" /> OPERADOR
                </span>
                <span
                  className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/60'
                      : 'bg-blue-950 text-blue-300 border border-blue-700/60'
                  }`}
                >
                  {isAdmin ? 'ADMIN' : 'VENDEDOR'}
                </span>
              </div>
              <div className="font-bold text-white text-xs truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                ID: @{currentUser.username}
              </div>

              <button
                onClick={onLogout}
                className="mt-2 w-full flex items-center justify-center gap-1.5 py-1 text-[11px] font-mono text-slate-300 hover:text-white bg-[#121924] hover:bg-slate-800 rounded border border-[#1E293B] transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                CAMBIAR OPERADOR
              </button>
            </div>
          )}
          <div className="mt-2 text-[9px] text-slate-400 text-center font-mono tracking-wider">
            JYC TERMINAL v2.5 • HEAVY ACQUISITIONS
          </div>
        </div>
      </aside>
    </>
  );
}
