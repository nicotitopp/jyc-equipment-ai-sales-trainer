import React from 'react';
import { Mode, User as UserType } from '../types';
import { 
  PhoneCall, BookOpen, UploadCloud, BarChart3, 
  RefreshCw, X, Shield, User, LogOut
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

export interface NavItemConfig {
  id: Mode;
  label: string;
  shortTitle: string;
  description: string;
  group: 'primary' | 'secondary';
  icon: React.ComponentType<{ className?: string }>;
}

export const MODES_LIST: NavItemConfig[] = [
  { 
    id: 'Live Call Simulation', 
    label: 'Call Practice', 
    shortTitle: 'Voice Call Practice',
    description: 'Train live phone calls with AI-simulated buyers',
    group: 'primary',
    icon: PhoneCall,
  },
  { 
    id: 'Coach', 
    label: 'Coach & Playbook', 
    shortTitle: 'Sales Coach & Playbooks',
    description: 'Prepare objection responses and study sector-specific scripts',
    group: 'primary',
    icon: BookOpen,
  },
  { 
    id: 'Real Call Audit', 
    label: 'Audit Recording', 
    shortTitle: 'Real Call Audio Audit',
    description: 'Upload audio from actual calls to analyze strengths and opportunities',
    group: 'secondary',
    icon: UploadCloud,
  },
  { 
    id: 'History', 
    label: 'History & Progress', 
    shortTitle: 'Practice History & Analytics',
    description: 'Review your past calls, scores, and audio recordings',
    group: 'secondary',
    icon: BarChart3,
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
  const primaryModes = MODES_LIST.filter(m => m.group === 'primary');
  const secondaryModes = MODES_LIST.filter(m => m.group === 'secondary');

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Navigation Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-68 bg-[#0F172A] text-slate-100 flex flex-col border-r border-slate-800 transform transition-transform duration-200 ease-out md:relative md:translate-x-0 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Identity */}
        <div className="px-5 py-5 border-b border-slate-800/80 flex items-center justify-between">
          <div 
            onClick={() => {
              onSelectMode('Live Call Simulation');
              onClose();
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-display font-bold text-base tracking-tight shadow-xs group-hover:bg-amber-400 transition-colors">
              JYC
            </div>
            <div>
              <div className="font-display font-bold text-sm text-white tracking-tight">
                JYC Equipment
              </div>
              <div className="text-xs text-slate-400">
                Sales Training
              </div>
            </div>
          </div>

          <button 
            className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          
          {/* Primary Section: Practice & Preparation */}
          <div>
            <div className="px-3 mb-2 text-xs font-medium text-slate-400">
              Training
            </div>

            <nav className="space-y-1" aria-label="Training">
              {primaryModes.map((item) => {
                const Icon = item.icon;
                const isActive = currentMode === item.id;
                const isCallItem = item.id === 'Live Call Simulation';

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectMode(item.id);
                      onClose();
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                      isActive
                        ? isCallItem
                          ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                          : 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${
                      isActive 
                        ? isCallItem ? 'text-slate-950' : 'text-amber-400' 
                        : 'text-slate-400'
                    }`} />
                    <div className="min-w-0">
                      <div className="text-sm leading-tight">
                        {item.label}
                      </div>
                      <p className={`text-xs leading-snug mt-0.5 line-clamp-2 ${
                        isActive 
                          ? isCallItem ? 'text-slate-900/80 font-normal' : 'text-slate-300 font-normal' 
                          : 'text-slate-400 font-normal'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Secondary Section: Evaluation & Progress */}
          <div>
            <div className="px-3 mb-2 text-xs font-medium text-slate-400">
              Analysis & Progress
            </div>

            <nav className="space-y-1" aria-label="Analysis & Progress">
              {secondaryModes.map((item) => {
                const Icon = item.icon;
                const isActive = currentMode === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectMode(item.id);
                      onClose();
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                      isActive
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${
                      isActive ? 'text-amber-400' : 'text-slate-400'
                    }`} />
                    <div className="min-w-0">
                      <div className="text-sm leading-tight">
                        {item.label}
                      </div>
                      <p className={`text-xs leading-snug mt-0.5 line-clamp-2 font-normal ${
                        isActive ? 'text-slate-300' : 'text-slate-400'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contextual Reset when inside Coach */}
          {currentMode === 'Coach' && (
            <div className="pt-2 border-t border-slate-800/80 px-1">
              <button
                onClick={onResetCoach}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-700/80 bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Coach Query</span>
              </button>
            </div>
          )}
        </div>

        {/* User Profile Footer */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/60">
          {currentUser && (
            <div className="flex items-center justify-between gap-2 px-2 py-1.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isAdmin ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    {isAdmin ? (
                      <>
                        <Shield className="w-3 h-3 text-indigo-400" />
                        <span>Supervisor</span>
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 text-slate-400" />
                        <span>Sales Rep</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
