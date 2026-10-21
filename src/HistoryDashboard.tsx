import React, { useState, useMemo } from 'react';
import { HistoryItem, User as UserType } from './types';
import Scorecard from './Scorecard';
import AdminUserManager from './AdminUserManager';
import { 
  BarChart, Calendar, Award, User, 
  Trash2, ArrowRight, Play, Upload, MessageSquare, Check, Headphones,
  Shield, Filter, Users, ChevronRight, Activity, Sparkles, PhoneCall
} from 'lucide-react';

interface HistoryDashboardProps {
  history: HistoryItem[];
  currentUser?: UserType | null;
  onClearHistory: () => void;
  onDeleteHistoryItem?: (id: string) => void;
  onNavigateToMode: (mode: 'Live Call Simulation' | 'Real Call Audit') => void;
}

export default function HistoryDashboard({ 
  history, 
  currentUser, 
  onClearHistory, 
  onDeleteHistoryItem,
  onNavigateToMode 
}: HistoryDashboardProps) {
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [selectedTraineeFilter, setSelectedTraineeFilter] = useState<string>('ALL');
  const [showManageUsers, setShowManageUsers] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  // Get unique trainees from history
  const traineesList = useMemo(() => {
    const map = new Map<string, { name: string; count: number; totalScore: number }>();
    for (const item of history) {
      const name = item.userName || 'Vendedor Practicante';
      const existing = map.get(name) || { name, count: 0, totalScore: 0 };
      existing.count += 1;
      existing.totalScore += (item.score || 0);
      map.set(name, existing);
    }
    return Array.from(map.values()).map(t => ({
      name: t.name,
      count: t.count,
      avgScore: Math.round(t.totalScore / t.count)
    }));
  }, [history]);

  // Filter history based on selected trainee
  const filteredHistory = useMemo(() => {
    if (!isAdmin || selectedTraineeFilter === 'ALL') {
      return history;
    }
    return history.filter(item => (item.userName || 'Vendedor Practicante') === selectedTraineeFilter);
  }, [history, isAdmin, selectedTraineeFilter]);

  if (selectedItem) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#06090E] text-slate-100">
        <div className="bg-[#0A0F17] px-4 sm:px-6 py-3.5 border-b border-[#1E293B] flex items-center justify-between no-print shadow-xl">
          <button 
            onClick={() => setSelectedItem(null)}
            className="px-3.5 py-1.5 bg-[#0E1522] hover:bg-[#162032] border border-[#1E293B] hover:border-slate-600 text-cyan-300 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            ← Volver a la Consola de Historial
          </button>
          <div className="flex items-center gap-2">
            {selectedItem.userName && (
              <span className="px-2.5 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-800 rounded-md text-xs font-mono font-bold">
                OPERADOR: {selectedItem.userName}
              </span>
            )}
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              {selectedItem.type} // {selectedItem.date}
            </span>
          </div>
        </div>
        <Scorecard 
          evaluation={selectedItem.evaluation} 
          onReset={() => setSelectedItem(null)} 
          audioId={selectedItem.id}
          audioUrl={selectedItem.audioUrl}
          conversationId={selectedItem.conversationId}
        />
      </div>
    );
  }

  // Calculate KPIs on filtered history
  const totalCalls = filteredHistory.length;
  const averageScore = totalCalls > 0 
    ? Math.round(filteredHistory.reduce((acc, curr) => acc + curr.score, 0) / totalCalls) 
    : 0;
  const passedCalls = filteredHistory.filter(item => item.score >= 70).length;
  const passRate = totalCalls > 0 
    ? Math.round((passedCalls / totalCalls) * 100) 
    : 0;

  // Last 10 items for the chart
  const chartItems = [...filteredHistory].slice(-10);

  const handleClear = () => {
    if (window.confirm("¿Estás seguro de que deseas borrar permanentemente el historial de llamadas?")) {
      onClearHistory();
    }
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("¿Eliminar este registro de llamada?")) {
      onDeleteHistoryItem?.(id);
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 bg-[#06090E] overflow-y-auto space-y-5 text-left text-slate-100">
      
      {/* Header Banner - Executive Operations Telemetry Board */}
      <div className="bg-[#0A0F17] rounded-2xl p-5 sm:p-6 border border-[#1E293B] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            {isAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 text-[10px] font-mono font-bold uppercase tracking-wider">
                <Shield className="w-3 h-3 text-indigo-400" /> Panel de Supervisión & Auditoría Central
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-bold uppercase tracking-wider">
                <User className="w-3 h-3 text-cyan-400" /> Registro de Desempeño Comercial
              </span>
            )}
            <span className="text-[10px] font-mono text-slate-400">CH-04</span>
          </div>

          <h2 className="text-lg sm:text-xl font-mono font-bold text-slate-100 tracking-tight uppercase">
            {isAdmin ? 'Telemetría de Desempeño Comercial' : 'Mi Historial de Entrenamiento'}
          </h2>
          <p className="text-slate-400 text-xs font-mono mt-0.5">
            {isAdmin 
              ? 'Audita grabaciones de audio, métricas de retención de guion y calificación de la fuerza de ventas.'
              : 'Monitorea tu evolución, fortalezas registradas y grabaciones de práctica con el agente de voz.'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2 shrink-0 relative z-10">
            <button
              onClick={() => setShowManageUsers(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-mono font-bold text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.3)]"
              title="Crear vendedores, consultar contraseñas y suspender accesos"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Gestión de Vendedores</span>
            </button>
            {totalCalls > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#0E1522] hover:bg-red-950/60 text-slate-400 hover:text-red-300 rounded-xl font-mono font-semibold text-xs border border-[#1E293B] hover:border-red-700/60 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Admin Filter Bar */}
      {isAdmin && traineesList.length > 0 && (
        <div className="bg-[#0A0F17] rounded-2xl p-4 border border-[#1E293B] shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>FILTRO POR VENDEDOR:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedTraineeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                selectedTraineeFilter === 'ALL'
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-600 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-[#080C14] text-slate-400 border-[#1E293B] hover:text-slate-200'
              }`}
            >
              TODOS ({history.length})
            </button>
            {traineesList.map(t => (
              <button
                key={t.name}
                onClick={() => setSelectedTraineeFilter(t.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  selectedTraineeFilter === t.name
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-600 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'bg-[#080C14] text-slate-400 border-[#1E293B] hover:text-slate-200'
                }`}
              >
                <span>{t.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  selectedTraineeFilter === t.name ? 'bg-cyan-900 text-cyan-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trainees Leaderboard Cards for Admin */}
      {isAdmin && selectedTraineeFilter === 'ALL' && traineesList.length > 1 && (
        <div className="bg-[#0A0F17] rounded-2xl p-5 border border-[#1E293B] shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <h3 className="font-mono font-bold text-slate-200 text-xs uppercase tracking-wider">
                Desempeño Comparativo de Fuerza Comercial
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">{traineesList.length} operadores registrados</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {traineesList.map(trainee => (
              <div 
                key={trainee.name}
                onClick={() => setSelectedTraineeFilter(trainee.name)}
                className="p-3.5 rounded-xl bg-[#080C14] border border-[#1E293B] hover:border-cyan-500/50 hover:bg-[#0E1522] transition-all cursor-pointer group space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-mono font-bold text-slate-100 text-xs truncate group-hover:text-cyan-300 transition-colors">
                      {trainee.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{trainee.count} {trainee.count === 1 ? 'llamada' : 'llamadas'}</p>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                    trainee.avgScore >= 80 
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' 
                      : trainee.avgScore >= 60 
                        ? 'bg-amber-950/80 text-amber-300 border-amber-700/60' 
                        : 'bg-red-950/80 text-red-300 border-red-700/60'
                  }`}>
                    {trainee.avgScore} pts
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1 text-[10px] font-mono font-bold text-cyan-400">
                  <span>Filtrar</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalCalls === 0 ? (
        <div className="bg-[#0A0F17] rounded-2xl p-12 border border-[#1E293B] text-center space-y-4 flex flex-col items-center">
          <div className="p-4 bg-[#0E1522] text-cyan-400 rounded-2xl border border-[#1E293B]">
            <BarChart className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base font-mono font-bold text-slate-100 uppercase">Sin Llamadas Registradas en la Bitácora</h3>
            <p className="text-slate-400 text-xs font-mono leading-relaxed">
              {isAdmin 
                ? 'Las simulaciones telefónicas y las auditorías de archivos se sincronizan en tiempo real en la base de datos central.'
                : 'Tus evaluaciones se registrarán automáticamente al finalizar una llamada o al auditar un audio.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md pt-2">
            <button
              onClick={() => onNavigateToMode('Live Call Simulation')}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.3)]"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Simulación Telefónica</span>
            </button>
            <button
              onClick={() => onNavigateToMode('Real Call Audit')}
              className="flex-1 py-3 bg-[#0E1522] hover:bg-[#162032] border border-[#1E293B] text-cyan-300 rounded-xl font-mono font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Auditar Archivo de Audio</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          
          {/* KPI Dashboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-[#0A0F17] rounded-2xl p-4 sm:p-5 border border-[#1E293B] flex items-center gap-3.5 shadow-2xl relative overflow-hidden">
              <div className="p-3 bg-blue-950/60 text-blue-400 border border-blue-700/60 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                  {selectedTraineeFilter === 'ALL' ? 'Promedio Global' : 'Promedio Vendedor'}
                </p>
                <h4 className="text-xl font-mono font-extrabold text-slate-100 mt-0.5">
                  {averageScore} <span className="text-xs text-slate-400 font-sans font-normal">/100 PTS</span>
                </h4>
              </div>
            </div>

            <div className="bg-[#0A0F17] rounded-2xl p-4 sm:p-5 border border-[#1E293B] flex items-center gap-3.5 shadow-2xl relative overflow-hidden">
              <div className="p-3 bg-indigo-950/60 text-indigo-400 border border-indigo-700/60 rounded-xl">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                  Llamadas Auditadas
                </p>
                <h4 className="text-xl font-mono font-extrabold text-slate-100 mt-0.5">
                  {totalCalls} <span className="text-xs text-slate-400 font-sans font-normal">sesiones</span>
                </h4>
              </div>
            </div>

            <div className="bg-[#0A0F17] rounded-2xl p-4 sm:p-5 border border-[#1E293B] flex items-center gap-3.5 shadow-2xl relative overflow-hidden">
              <div className="p-3 bg-emerald-950/60 text-emerald-400 border border-emerald-700/60 rounded-xl">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                  Tasa Aprobación (≥70)
                </p>
                <h4 className="text-xl font-mono font-extrabold text-slate-100 mt-0.5">
                  {passRate}% <span className="text-xs text-slate-400 font-sans font-normal">({passedCalls}/{totalCalls})</span>
                </h4>
              </div>
            </div>

          </div>

          {/* Progress Chart */}
          <div className="bg-[#0A0F17] rounded-2xl p-5 border border-[#1E293B] shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <h3 className="font-mono font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Evolución Cronológica de Rendimiento (Últimas 10 llamadas)
              </h3>
              {selectedTraineeFilter !== 'ALL' && (
                <span className="text-xs font-mono font-bold text-cyan-400">
                  Filtro: {selectedTraineeFilter}
                </span>
              )}
            </div>
            
            <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-4 border-b border-[#1E293B] px-3 bg-[#080C14] rounded-xl border">
              {chartItems.map((item, idx) => (
                <div 
                  key={item.id} 
                  className="flex-1 flex flex-col items-center group h-full justify-end cursor-pointer" 
                  onClick={() => setSelectedItem(item)}
                >
                  <span className="text-[10px] font-mono font-bold text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    {item.score}
                  </span>
                  <div 
                    className="w-full rounded-t transition-all duration-200 hover:brightness-125"
                    style={{ 
                      height: `${Math.max(item.score, 6)}%`,
                      backgroundColor: item.score >= 80 ? '#10B981' : item.score >= 60 ? '#F59E0B' : '#EF4444',
                      boxShadow: item.score >= 80 ? '0 0 10px rgba(16,185,129,0.3)' : item.score >= 60 ? '0 0 10px rgba(245,158,11,0.3)' : '0 0 10px rgba(239,68,68,0.3)'
                    }}
                  />
                  <span className="text-[9px] font-mono text-slate-400 mt-2 truncate w-full text-center">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-2 uppercase tracking-wide">
              <span>← LLAMADAS ANTERIORES</span>
              <span>MÁS RECIENTES →</span>
            </div>
          </div>

          {/* List of Audits */}
          <div className="bg-[#0A0F17] rounded-2xl border border-[#1E293B] shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#1E293B] flex items-center justify-between">
              <h3 className="font-mono font-bold text-slate-200 text-xs uppercase tracking-wider">
                Bitácora Detallada de Auditorías
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {filteredHistory.length} registros cargados
              </span>
            </div>

            <div className="divide-y divide-[#1E293B]">
              {[...filteredHistory].map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#0E1522] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-xl shrink-0 border ${
                      item.type === 'Live Call' 
                        ? 'bg-blue-950/60 text-blue-400 border-blue-700/60' 
                        : 'bg-amber-950/60 text-amber-400 border-amber-700/60'
                    }`}>
                      {item.type === 'Live Call' ? <Play className="w-4 h-4 fill-current" /> : <Upload className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-slate-100 text-xs sm:text-sm truncate group-hover:text-cyan-300 transition-colors">
                          {item.companyName}
                        </span>

                        {item.userName && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {item.userName}
                          </span>
                        )}

                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#080C14] text-slate-400 border border-[#1E293B] uppercase">
                          {item.type}
                        </span>

                        {(item.hasAudio ?? true) && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            <Headphones className="w-2.5 h-2.5" /> AUDIO
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {item.contactName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-[#1E293B] pt-2 sm:pt-0">
                    <span 
                      className="text-xs font-mono font-extrabold px-3 py-1 rounded-lg border"
                      style={{
                        backgroundColor: item.score >= 80 ? 'rgba(6, 78, 59, 0.4)' : item.score >= 60 ? 'rgba(120, 53, 15, 0.4)' : 'rgba(127, 29, 29, 0.4)',
                        borderColor: item.score >= 80 ? '#059669' : item.score >= 60 ? '#D97706' : '#DC2626',
                        color: item.score >= 80 ? '#34D399' : item.score >= 60 ? '#FBBF24' : '#F87171'
                      }}
                    >
                      {item.score} PTS
                    </span>

                    {isAdmin && onDeleteHistoryItem && (
                      <button
                        onClick={(e) => handleDeleteItem(e, item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* User & Password Management Modal for Admin */}
      {showManageUsers && (
        <AdminUserManager onClose={() => setShowManageUsers(false)} />
      )}

    </div>
  );
}