import React from 'react';
import { User as UserType, Mode } from '../types';
import { MODES_LIST } from './Sidebar';
import { Menu, Volume2, VolumeX, PhoneCall } from 'lucide-react';

interface HeaderProps {
  mode: Mode;
  currentUser: UserType | null;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onOpenSidebar: () => void;
  onLogout: () => void;
  modeDescription: string;
  onSelectMode?: (mode: Mode) => void;
}

export default function Header({
  mode,
  voiceEnabled,
  onToggleVoice,
  onOpenSidebar,
  modeDescription,
  onSelectMode,
}: HeaderProps) {
  const modeInfo = MODES_LIST.find(m => m.id === mode);
  const title = modeInfo?.shortTitle || mode;

  return (
    <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 z-20">
      
      {/* Left: Mobile Menu & View Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-display font-bold text-slate-900 tracking-tight truncate">
            {title}
          </h1>
          <p className="text-xs text-slate-500 truncate hidden sm:block">
            {modeDescription}
          </p>
        </div>
      </div>

      {/* Right: Contextual Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        
        {/* Quick CTA to start a practice call when in other sections */}
        {mode !== 'Live Call Simulation' && onSelectMode && (
          <button
            onClick={() => onSelectMode('Live Call Simulation')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Practice Call</span>
          </button>
        )}

        {/* Voice output toggle when in Coach */}
        {mode === 'Coach' && (
          <button
            onClick={onToggleVoice}
            title={voiceEnabled ? 'Mute voice audio' : 'Listen to responses with voice'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              voiceEnabled
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {voiceEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="hidden sm:inline">
              {voiceEnabled ? 'Voice enabled' : 'Voice muted'}
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
