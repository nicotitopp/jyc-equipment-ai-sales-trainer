import React, { useState, useMemo } from 'react';
import { HistoryItem, User as UserType } from './types';
import Scorecard from './Scorecard';
import AdminUserManager from './AdminUserManager';
import { 
  BarChart, Calendar, Award, User, 
  Trash2, ArrowRight, Play, Upload, MessageSquare, Check, Headphones,
  Shield, Filter, Users, ChevronRight
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
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="bg-white px-4 sm:px-6 py-3 border-b border-slate-200 flex items-center justify-between no-print shadow-xs">
          <button 
            onClick={() => setSelectedItem(null)}
            className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            ← Volver al Panel de Historial
          </button>
          <div className="flex items-center gap-2">
            {selectedItem.userName && (
              <span className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-md text-xs font-mono font-bold">
                {selectedItem.userName}
              </span>
            )}
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              {selectedItem.type} • {selectedItem.date}
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
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 bg-slate-50 overflow-y-auto space-y-5 text-left">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-mono font-bold uppercase tracking-wider">
                <Shield className="w-3 h-3" /> Panel de Supervisión (Admin)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono font-bold uppercase tracking-wider">
                <User className="w-3 h-3" /> Historial Comercial
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isAdmin ? 'Supervisión de Desempeño Comercial' : 'Mi Historial de Entrenamiento'}
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {isAdmin 
              ? 'Audita grabaciones, scorecards y métricas de adquisición de todo el equipo comercial.'
              : 'Monitorea tu evolución, fortalezas registradas y grabaciones de práctica.'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowManageUsers(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              title="Crear vendedores, cambiar contraseñas y gestionar accesos"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Gestión de Vendedores</span>
            </button>
            {totalCalls > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-lg font-semibold text-xs border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
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
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Filtrar por Vendedor:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedTraineeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedTraineeFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({history.length})
            </button>
            {traineesList.map(t => (
              <button
                key={t.name}
                onClick={() => setSelectedTraineeFilter(t.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTraineeFilter === t.name
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{t.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  selectedTraineeFilter === t.name ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-700'
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
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                Desempeño Comparativo por Vendedor
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">{traineesList.length} vendedores registrados</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {traineesList.map(trainee => (
              <div 
                key={trainee.name}
                onClick={() => setSelectedTraineeFilter(trainee.name)}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate group-hover:text-indigo-700 transition-colors">
                      {trainee.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{trainee.count} {trainee.count === 1 ? 'llamada' : 'llamadas'}</p>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    trainee.avgScore >= 80 ? 'bg-emerald-100 text-emerald-800' : trainee.avgScore >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {trainee.avgScore} pts
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1 mt-2.5 text-[11px] font-semibold text-indigo-600">
                  <span>Filtrar</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalCalls === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center space-y-4 flex flex-col items-center">
          <div className="p-3.5 bg-slate-100 text-slate-400 rounded-xl">
            <BarChart className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base font-bold text-slate-800">No hay llamadas registradas aún</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              {isAdmin 
                ? 'Las simulaciones y auditorías realizadas por los vendedores se sincronizan en tiempo real en la base de datos central.'
                : 'Tus evaluaciones se registrarán automáticamente al finalizar una llamada en vivo o al auditar un audio.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md pt-2">
            <button
              onClick={() => onNavigateToMode('Live Call Simulation')}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Simulación de Llamada
            </button>
            <button
              onClick={() => onNavigateToMode('Real Call Audit')}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Auditar Archivo de Audio
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          
          {/* KPI Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 flex items-center gap-3.5 shadow-xs">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                  {selectedTraineeFilter === 'ALL' ? 'Promedio Global' : 'Promedio Vendedor'}
                </p>
                <h4 className="text-xl font-mono font-extrabold text-slate-900 mt-0.5">
                  {averageScore} <span className="text-xs text-slate-400 font-semibold font-sans">/100</span>
                </h4>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 flex items-center gap-3.5 shadow-xs">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                  Llamadas Auditadas
                </p>
                <h4 className="text-xl font-mono font-extrabold text-slate-900 mt-0.5">
                  {totalCalls} <span className="text-xs text-slate-400 font-semibold font-sans">sesiones</span>
                </h4>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 flex items-center gap-3.5 shadow-xs">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                  Tasa Aprobación (≥70)
                </p>
                <h4 className="text-xl font-mono font-extrabold text-slate-900 mt-0.5">
                  {passRate}% <span className="text-xs text-slate-400 font-semibold font-sans">({passedCalls}/{totalCalls})</span>
                </h4>
              </div>
            </div>

          </div>

          {/* Progress Chart */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                Evolución de Puntajes (Últimas 10 llamadas)
              </h3>
              {selectedTraineeFilter !== 'ALL' && (
                <span className="text-xs font-semibold text-indigo-600">
                  Filtro: {selectedTraineeFilter}
                </span>
              )}
            </div>
            
            <div className="h-40 flex items-end justify-between gap-2 sm:gap-4 pt-3 border-b border-slate-200 px-3">
              {chartItems.map((item, idx) => (
                <div 
                  key={item.id} 
                  className="flex-1 flex flex-col items-center group h-full justify-end cursor-pointer" 
                  onClick={() => setSelectedItem(item)}
                >
                  <span className="text-[10px] font-mono font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    {item.score}
                  </span>
                  <div 
                    className="w-full rounded-t transition-all duration-200 hover:opacity-80"
                    style={{ 
                      height: `${item.score}%`,
                      backgroundColor: item.score >= 80 ? '#10B981' : item.score >= 60 ? '#F59E0B' : '#EF4444' 
                    }}
                  />
                  <span className="text-[9px] font-mono text-slate-400 mt-2 truncate w-full text-center">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-2 uppercase tracking-wide">
              <span>← Más antiguas</span>
              <span>Más recientes →</span>
            </div>
          </div>

          {/* List of Audits */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                Registro Histórico de Auditorías
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {filteredHistory.length} registros
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {[...filteredHistory].map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      item.type === 'Live Call' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {item.type === 'Live Call' ? <Play className="w-4 h-4 fill-current" /> : <Upload className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {item.companyName}
                        </span>

                        {item.userName && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {item.userName}
                          </span>
                        )}

                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">
                          {item.type}
                        </span>

                        {(item.hasAudio ?? true) && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Headphones className="w-2.5 h-2.5" /> Audio
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {item.contactName}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="flex items-center gap-1.5">
                      <span 
                        className="text-xs font-mono font-extrabold px-2.5 py-1 rounded"
                        style={{
                          backgroundColor: item.score >= 80 ? '#ECFDF5' : item.score >= 60 ? '#FFFBEB' : '#FEF2F2',
                          color: item.score >= 80 ? '#047857' : item.score >= 60 ? '#B45309' : '#B91C1C'
                        }}
                      >
                        {item.score} pts
                      </span>
                    </div>

                    {isAdmin && onDeleteHistoryItem && (
                      <button
                        onClick={(e) => handleDeleteItem(e, item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block" />
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
