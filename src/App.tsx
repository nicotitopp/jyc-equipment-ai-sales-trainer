import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Mode, HistoryItem, User as UserType } from './types';
import Header from './components/Header';
import Sidebar, { MODES_LIST } from './components/Sidebar';
import CoachView from './pages/CoachView';
import LoginModal from './LoginModal';
import { clearAllAudios } from './audioDb';
import { api } from './services/api';
import { Loader2 } from 'lucide-react';

// Code-split heavy views to reduce initial bundle and improve TTI
const LiveCall = lazy(() => import('./LiveCall'));
const RealCallAudit = lazy(() => import('./RealCallAudit'));
const HistoryDashboard = lazy(() => import('./HistoryDashboard'));

const MODE_TO_HASH: Record<Mode, string> = {
  'Coach': '#coach',
  'Live Call Simulation': '#live-call',
  'Real Call Audit': '#audit',
  'History': '#history',
};

const HASH_TO_MODE: Record<string, Mode> = {
  '#coach': 'Coach',
  '#live-call': 'Live Call Simulation',
  '#audit': 'Real Call Audit',
  '#history': 'History',
};

function getModeFromHash(): Mode {
  const hash = window.location.hash.toLowerCase();
  return HASH_TO_MODE[hash] || 'Coach';
}

export default function App() {
  const [mode, setMode] = useState<Mode>(getModeFromHash);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    try {
      const saved = localStorage.getItem('jyc_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [showLoginModal, setShowLoginModal] = useState<boolean>(!currentUser);

  // Sales Evaluation History
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('jyc_sales_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const coachResetRef = useRef<(() => void) | null>(null);

  // Sync mode with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash.toLowerCase();
      const targetMode = HASH_TO_MODE[currentHash];
      if (targetMode) {
        setMode(targetMode);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectMode = (newMode: Mode) => {
    setMode(newMode);
    const targetHash = MODE_TO_HASH[newMode] || '#coach';
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  };

  // Sync history with backend database
  const syncHistoryWithBackend = async (user: UserType) => {
    try {
      const items = await api.fetchHistory(user);
      if (Array.isArray(items)) {
        setHistory(items);
        localStorage.setItem('jyc_sales_history', JSON.stringify(items));
      }
    } catch (err) {
      console.warn("Could not sync history with backend:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      syncHistoryWithBackend(currentUser);
    }
  }, [currentUser]);

  // Voice synthesis cancellation when leaving Live Call
  useEffect(() => {
    if (mode === 'Live Call Simulation') {
      setVoiceEnabled(true);
    } else {
      window.speechSynthesis.cancel();
    }
  }, [mode]);

  const appendToHistory = async (
    score: number, 
    evaluation: any, 
    contactName: string, 
    companyName: string, 
    type: 'Live Call' | 'Audio Upload',
    options?: { id?: string; hasAudio?: boolean; conversationId?: string; audioUrl?: string }
  ) => {
    const newItem: HistoryItem = {
      id: options?.id || (Date.now().toString() + Math.random().toString().substring(2, 6)),
      userId: currentUser?.id || 'trainee_default',
      userName: currentUser?.name || 'Vendedor Practicante',
      date: new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      timestamp: Date.now(),
      type,
      contactName,
      companyName,
      score,
      evaluation,
      hasAudio: options?.hasAudio ?? true,
      conversationId: options?.conversationId,
      audioUrl: options?.audioUrl
    };

    setHistory(prev => {
      const updated = [newItem, ...prev.filter(h => h.id !== newItem.id)];
      localStorage.setItem('jyc_sales_history', JSON.stringify(updated));
      return updated;
    });

    try {
      await api.saveHistoryItem(newItem, currentUser?.role || 'trainee');
    } catch (err) {
      console.warn("Could not save history to central database:", err);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.clearHistory(currentUser?.role || 'trainee', currentUser?.id);
    } catch (err) {
      console.warn("Could not clear history on server:", err);
    }
    localStorage.removeItem('jyc_sales_history');
    clearAllAudios().catch(console.error);
    setHistory([]);
  };

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await api.deleteHistoryItem(id);
    } catch (err) {
      console.warn("Could not delete item on server:", err);
    }
    setHistory(prev => {
      const updated = prev.filter(h => h.id !== id);
      localStorage.setItem('jyc_sales_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('jyc_user');
    setCurrentUser(null);
    setShowLoginModal(true);
  };

  const handleLogin = (user: UserType) => {
    setCurrentUser(user);
    localStorage.setItem('jyc_user', JSON.stringify(user));
    setShowLoginModal(false);
    syncHistoryWithBackend(user);
  };

  const currentModeInfo = MODES_LIST.find(m => m.id === mode);
  const modeDescription = currentModeInfo?.description || 'Plataforma de Adquisición de Maquinaria';

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar
        currentMode={mode}
        onSelectMode={handleSelectMode}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onResetCoach={() => coachResetRef.current?.()}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Header Bar */}
        <Header
          mode={mode}
          currentUser={currentUser}
          voiceEnabled={voiceEnabled}
          onToggleVoice={() => {
            const next = !voiceEnabled;
            setVoiceEnabled(next);
            if (!next) window.speechSynthesis.cancel();
          }}
          onOpenSidebar={() => setSidebarOpen(true)}
          onLogout={handleLogout}
          modeDescription={modeDescription}
        />

        {/* View Router */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {mode === 'Coach' && (
            <CoachView
              voiceEnabled={voiceEnabled}
              onResetRef={coachResetRef}
            />
          )}

          {mode === 'Live Call Simulation' && (
            <Suspense fallback={
              <div className="flex-1 flex flex-col items-center justify-center space-y-3 bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-xs font-semibold text-slate-500">Cargando simulador de voz ElevenLabs...</span>
              </div>
            }>
              <LiveCall 
                onEvaluationComplete={(score, evalData, contact, company, opts) => 
                  appendToHistory(score, evalData, contact, company, 'Live Call', opts)
                } 
              />
            </Suspense>
          )}

          {mode === 'Real Call Audit' && (
            <Suspense fallback={
              <div className="flex-1 flex flex-col items-center justify-center space-y-3 bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-xs font-semibold text-slate-500">Cargando módulo de auditoría...</span>
              </div>
            }>
              <RealCallAudit 
                onEvaluationComplete={(score, evalData, contact, company, opts) => 
                  appendToHistory(score, evalData, contact, company, 'Audio Upload', opts)
                } 
              />
            </Suspense>
          )}

          {mode === 'History' && (
            <Suspense fallback={
              <div className="flex-1 flex flex-col items-center justify-center space-y-3 bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-xs font-semibold text-slate-500">Cargando historial y métricas...</span>
              </div>
            }>
              <HistoryDashboard 
                history={history} 
                currentUser={currentUser}
                onClearHistory={handleClearHistory} 
                onDeleteHistoryItem={handleDeleteHistoryItem}
                onNavigateToMode={(targetMode) => handleSelectMode(targetMode)} 
              />
            </Suspense>
          )}
        </div>

      </div>

      {/* Authentication Modal */}
      {showLoginModal && (
        <LoginModal onLogin={handleLogin} />
      )}
    </div>
  );
}
