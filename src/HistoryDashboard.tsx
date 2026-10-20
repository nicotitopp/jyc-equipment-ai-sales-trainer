import React, { useState, useMemo } from 'react';
import { HistoryItem, User as UserType } from './types';
import Scorecard from './Scorecard';
import AdminUserManager from './AdminUserManager';
import { 
  BarChart, Calendar, Award, User, Briefcase, 
  Trash2, ArrowRight, Play, Upload, MessageSquare, AlertCircle, Check, Headphones,
  Shield, Filter, Users, ChevronRight, Key, UserPlus
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
      const name = item.userName || 'Practicante';
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
    return history.filter(item => (item.userName || 'Practicante') === selectedTraineeFilter);
  }, [history, isAdmin, selectedTraineeFilter]);

  if (selectedItem) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center justify-between no-print">
          <button 
            onClick={() => setSelectedItem(null)}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            ← Volver al Panel de Historial
          </button>
          <div className="flex items-center gap-2">
            {selectedItem.userName && (
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold">
                👤 {selectedItem.userName}
              </span>
            )}
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Auditoría {selectedItem.type} - {selectedItem.date}
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
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 bg-slate-50 overflow-y-auto space-y-6 text-left">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-black uppercase tracking-wide">
                <Shield className="w-3 h-3" /> Panel de Supervisión (Admin)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black uppercase tracking-wide">
                <User className="w-3 h-3" /> Historial Personal del Practicante
              </span>
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isAdmin ? 'Supervisión de Desempeño Comercial' : 'Mi Historial de Entrenamiento'}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {isAdmin 
              ? 'Revisa las llamadas grabadas, scorecards y progreso de todos los practicantes del equipo.'
              : 'Revisa tu progreso, evalúa tus fortalezas y consulta tus scorecards anteriores.'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowManageUsers(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs border border-indigo-200 transition-colors cursor-pointer shadow-xs"
              title="Crear vendedores, cambiar contraseñas y gestionar accesos"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Gestión de Vendedores</span>
            </button>
            {totalCalls > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs border border-red-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar Historial</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Admin Filter Bar */}
      {isAdmin && traineesList.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Filtrar por Practicante:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTraineeFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTraineeFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos los practicantes ({history.length})
            </button>
            {traineesList.map(t => (
              <button
                key={t.name}
                onClick={() => setSelectedTraineeFilter(t.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTraineeFilter === t.name
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{t.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
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
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm">Resumen por Practicante</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{traineesList.length} practicantes registrados</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {traineesList.map(trainee => (
              <div 
                key={trainee.name}
                onClick={() => setSelectedTraineeFilter(trainee.name)}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">
                      {trainee.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{trainee.count} {trainee.count === 1 ? 'llamada' : 'llamadas'} realizadas</p>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                    trainee.avgScore >= 80 ? 'bg-emerald-100 text-emerald-800' : trainee.avgScore >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {trainee.avgScore}/100
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1 mt-3 text-[11px] font-bold text-indigo-600">
                  <span>Ver llamadas</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalCalls === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-6 flex flex-col items-center">
          <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl">
            <BarChart className="w-10 h-10" />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-lg font-bold text-slate-800">No hay llamadas registradas aún</h3>
            <p className="text-slate-500 text-sm">
              {isAdmin 
                ? 'Las simulaciones y auditorías realizadas por los practicantes aparecerán aquí en tiempo real en la base de datos central.'
                : 'Tus evaluaciones se guardarán aquí automáticamente en cuanto completes una llamada en vivo o audites un archivo.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md pt-2">
            <button
              onClick={() => onNavigateToMode('Live Call Simulation')}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-200"
            >
              <Play className="w-4 h-4 fill-white" />
              Practicar Llamada en Vivo
            </button>
            <button
              onClick={() => onNavigateToMode('Real Call Audit')}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Auditar Audio de Llamada
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* KPI Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* KPI 1 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  {selectedTraineeFilter === 'ALL' ? 'Promedio General' : 'Promedio Practicante'}
                </p>
                <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{averageScore} <span className="text-xs text-slate-400 font-semibold">/100</span></h4>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Llamadas Auditadas</p>
                <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{totalCalls} <span className="text-xs text-slate-400 font-semibold">llamadas</span></h4>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tasa de Aprobación (&gt;=70)</p>
                <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{passRate}% <span className="text-xs text-slate-400 font-semibold">({passedCalls}/{totalCalls})</span></h4>
              </div>
            </div>

          </div>

          {/* Progress Chart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm">
                Tendencia de Calificaciones (Últimas 10 llamadas)
              </h3>
              {selectedTraineeFilter !== 'ALL' && (
                <span className="text-xs font-bold text-indigo-600">
                  Mostrando solo: {selectedTraineeFilter}
                </span>
              )}
            </div>
            
            <div className="h-48 flex items-end justify-between gap-2 sm:gap-6 pt-4 border-b border-slate-200 px-4">
              {chartItems.map((item, idx) => (
                <div key={item.id} className="flex-1 flex flex-col items-center group h-full justify-end cursor-pointer" onClick={() => setSelectedItem(item)}>
                  <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1">{item.score}</span>
                  <div 
                    className="w-full rounded-t-md transition-all duration-300 hover:opacity-85"
                    style={{ 
                      height: `${item.score}%`,
                      backgroundColor: item.score >= 80 ? '#10B981' : item.score >= 60 ? '#F59E0B' : '#EF4444' 
                    }}
                  />
                  <span className="text-[9px] font-semibold text-slate-400 mt-2 whitespace-nowrap truncate w-full text-center">
                    {idx + 1}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold px-2 uppercase tracking-wide">
              <span>← Llamadas Anteriores</span>
              <span>Llamadas Recientes →</span>
            </div>
          </div>

          {/* List of Audits */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">
                Registro Detallado de Auditorías
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {filteredHistory.length} registros encontrados
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {[...filteredHistory].map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      item.type === 'Live Call' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {item.type === 'Live Call' ? <Play className="w-5 h-5 fill-current" /> : <Upload className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">
                          {item.companyName}
                        </span>

                        {/* Trainee name tag (especially useful for Admin) */}
                        {item.userName && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            👤 {item.userName}
                          </span>
                        )}

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase">
                          {item.type}
                        </span>

                        {(item.hasAudio ?? true) && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Headphones className="w-2.5 h-2.5" /> Audio Grabado
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          Contacto: {item.contactName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-bold uppercase">Nota</span>
                      <span 
                        className="text-lg font-extrabold px-3 py-1 rounded-xl"
                        style={{
                          backgroundColor: item.score >= 80 ? '#ECFDF5' : item.score >= 60 ? '#FFFBEB' : '#FEF2F2',
                          color: item.score >= 80 ? '#047857' : item.score >= 60 ? '#B45309' : '#B91C1C'
                        }}
                      >
                        {item.score}
                      </span>
                    </div>

                    {isAdmin && onDeleteHistoryItem && (
                      <button
                        onClick={(e) => handleDeleteItem(e, item.id)}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <ArrowRight className="w-5 h-5 text-slate-300 hidden sm:block" />
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
