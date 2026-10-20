import React from 'react';
import { Mode, User as UserType } from '../types';
import { 
  GraduationCap, PhoneCall, UploadCloud, BarChart3, 
  RefreshCw, X, Shield, User, LogOut, Radio
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

export const MODES_LIST: { id: Mode; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { 
    id: 'Coach', 
    label: 'Coach & Playbook', 
    icon: GraduationCap, 
    description: 'Guía de argumentos, objeciones y catálogo interactivo' 
  },
  { 
    id: 'Live Call Simulation', 
    label: 'Simulación en Vivo', 
    icon: PhoneCall, 
    description: 'Llamada por voz en tiempo real con comprador prospecto' 
  },
  { 
    id: 'Real Call Audit', 
    label: 'Auditar Grabación', 
    icon: UploadCloud, 
    description: 'Sube un audio real y recibe evaluación de Gemini' 
  },
  { 
    id: 'History', 
    label: 'Métricas & Historial', 
    icon: BarChart3, 
    description: 'Supervisión de llamadas, KPIs y grabaciones guardadas' 
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
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Rail */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-slate-100 flex flex-col border-r border-slate-800 transform transition-transform duration-200 ease-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-base tracking-wider shadow-inner shadow-blue-400/30">
              JYC
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white leading-tight">
                JYC EQUIPMENT
              </div>
              <div className="text-[10px] font-mono font-medium text-slate-400 tracking-wider uppercase flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Sales Simulator
              </div>
            </div>
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-6 dark-scrollbar">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2 mb-2">
              Módulos de Entrenamiento
            </div>
            <nav className="space-y-1" aria-label="Navegación principal">
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
                    className={`w-full text-left p-2.5 rounded-lg flex items-start gap-3 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-md ${
                      isActive ? 'bg-blue-700 text-white' : 'bg-slate-800/70 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs leading-tight font-medium">
                        {item.label}
                      </div>
                      <div className={`text-[11px] leading-snug mt-0.5 line-clamp-2 ${
                        isActive ? 'text-blue-100' : 'text-slate-400'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-slate-800/60">
            <button
              onClick={onResetCoach}
              disabled={currentMode !== 'Coach'}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Reinicia la conversación del entrenador"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reiniciar Conversación
            </button>
          </div>
        </div>

        {/* User Card & Supervision Status */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/40">
          {currentUser && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  Sesión Activa
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/60'
                      : 'bg-blue-950 text-blue-300 border border-blue-700/60'
                  }`}
                >
                  {isAdmin ? 'ADMIN' : 'VENDEDOR'}
                </span>
              </div>
              <div className="font-semibold text-white text-xs truncate">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-400 font-mono truncate">
                @{currentUser.username}
              </div>

              <button
                onClick={onLogout}
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cambiar de Usuario
              </button>
            </div>
          )}
          <div className="mt-2 text-[10px] text-slate-400 text-center font-mono">
            Portal Corporativo • Adquisiciones
          </div>
        </div>
      </aside>
    </>
  );
}
