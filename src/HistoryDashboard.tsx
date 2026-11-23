import React, { useState, useMemo, useEffect } from 'react';
import { HistoryItem, User as UserType, SpendAnalytics } from './types';
import Scorecard from './Scorecard';
import AdminUserManager from './AdminUserManager';
import { api } from './services/api';
import { 
  BarChart, Calendar, Award, User, 
  Trash2, ArrowRight, Play, Upload, Check, Headphones,
  Shield, Filter, Users, ChevronRight, PhoneCall,
  DollarSign, Clock, Zap, TrendingUp
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
  const [spendAnalytics, setSpendAnalytics] = useState<SpendAnalytics | null>(null);
  const [activeSpendMetric, setActiveSpendMetric] = useState<'cost' | 'minutes' | 'credits' | 'calls'>('cost');

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      api.fetchSpendAnalytics()
        .then(data => setSpendAnalytics(data))
        .catch(err => console.warn('Could not load spend analytics:', err));
    }
  }, [isAdmin, history.length]);

  const traineesList = useMemo(() => {
    const map = new Map<string, { 
      name: string; 
      count: number; 
      totalScore: number;
      totalCostUsd: number;
      totalDurationSecs: number;
    }>();
    for (const item of history) {
      const name = item.userName || 'Sales Rep';
      const existing = map.get(name) || { 
        name, 
        count: 0, 
        totalScore: 0,
        totalCostUsd: 0,
        totalDurationSecs: 0 
      };
      existing.count += 1;
      existing.totalScore += (item.score || 0);
      existing.totalCostUsd += (Number(item.costUsd) || 0);
      existing.totalDurationSecs += (Number(item.durationSecs) || 0);
      map.set(name, existing);
    }
    return Array.from(map.values()).map(t => ({
      name: t.name,
      count: t.count,
      avgScore: Math.round(t.totalScore / t.count),
      totalCostUsd: Number(t.totalCostUsd.toFixed(2)),
      totalMinutes: Number((t.totalDurationSecs / 60).toFixed(1))
    })).sort((a, b) => b.totalCostUsd - a.totalCostUsd);
  }, [history]);

  const companySummary = useMemo(() => {
    if (spendAnalytics?.summary) {
      return spendAnalytics.summary;
    }
    const totalCalls = history.length;
    const totalCostUsd = Number(history.reduce((sum, h) => sum + (Number(h.costUsd) || 0), 0).toFixed(2));
    const totalSecs = history.reduce((sum, h) => sum + (Number(h.durationSecs) || 0), 0);
    const totalMinutes = Number((totalSecs / 60).toFixed(1));
    const totalHours = Number((totalSecs / 3600).toFixed(1));
    const totalCredits = Math.round(history.reduce((sum, h) => sum + (Number(h.creditsUsed) || 0), 0));
    return {
      totalCostUsd,
      totalMinutes,
      totalHours,
      totalCalls,
      totalCredits,
      avgCostPerCall: totalCalls > 0 ? Number((totalCostUsd / totalCalls).toFixed(2)) : 0,
      avgMinutesPerCall: totalCalls > 0 ? Number((totalMinutes / totalCalls).toFixed(1)) : 0
    };
  }, [spendAnalytics, history]);

  const userStatsList = useMemo(() => {
    if (spendAnalytics?.users && spendAnalytics.users.length > 0) {
      return spendAnalytics.users;
    }
    return traineesList.map(t => {
      const cost = t.totalCostUsd;
      const mins = t.totalMinutes;
      const count = t.count;
      const totalCost = companySummary.totalCostUsd;
      const totalMins = companySummary.totalMinutes;
      return {
        userId: t.name,
        username: t.name.toLowerCase().replace(/\s+/g, '_'),
        name: t.name,
        role: 'trainee',
        callCount: count,
        totalDurationSecs: mins * 60,
        totalMinutes: mins,
        totalCostUsd: cost,
        totalCredits: Math.round(mins * 60 * 9.1),
        avgCostPerCall: count > 0 ? Number((cost / count).toFixed(2)) : 0,
        avgMinutesPerCall: count > 0 ? Number((mins / count).toFixed(1)) : 0,
        percentageOfTotalCost: totalCost > 0 ? Number(((cost / totalCost) * 100).toFixed(1)) : 0,
        percentageOfTotalTime: totalMins > 0 ? Number(((mins / totalMins) * 100).toFixed(1)) : 0
      };
    }).sort((a, b) => b.totalCostUsd - a.totalCostUsd);
  }, [spendAnalytics, traineesList, companySummary]);

  const chartUserItems = useMemo(() => {
    const list = [...userStatsList];
    if (activeSpendMetric === 'cost') {
      return list.sort((a, b) => b.totalCostUsd - a.totalCostUsd);
    }
    if (activeSpendMetric === 'minutes') {
      return list.sort((a, b) => b.totalMinutes - a.totalMinutes);
    }
    if (activeSpendMetric === 'credits') {
      return list.sort((a, b) => b.totalCredits - a.totalCredits);
    }
    return list.sort((a, b) => b.callCount - a.callCount);
  }, [userStatsList, activeSpendMetric]);

  const maxChartValue = useMemo(() => {
    if (chartUserItems.length === 0) return 1;
    if (activeSpendMetric === 'cost') return Math.max(...chartUserItems.map(u => u.totalCostUsd), 1);
    if (activeSpendMetric === 'minutes') return Math.max(...chartUserItems.map(u => u.totalMinutes), 1);
    if (activeSpendMetric === 'credits') return Math.max(...chartUserItems.map(u => u.totalCredits), 1);
    return Math.max(...chartUserItems.map(u => u.callCount), 1);
  }, [chartUserItems, activeSpendMetric]);

  const filteredHistory = useMemo(() => {
    if (!isAdmin || selectedTraineeFilter === 'ALL') {
      return history;
    }
    return history.filter(item => (item.userName || 'Sales Rep') === selectedTraineeFilter);
  }, [history, isAdmin, selectedTraineeFilter]);

  if (selectedItem) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#F4F6F9]">
        <div className="bg-white px-4 sm:px-6 py-3 border-b border-slate-200/80 flex items-center justify-between no-print">
          <button 
            onClick={() => setSelectedItem(null)}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            ← Back to history
          </button>
          <div className="flex items-center gap-2">
            {selectedItem.userName && (
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                {selectedItem.userName}
              </span>
            )}
            <span className="text-xs text-slate-500 hidden sm:inline">
              {selectedItem.type === 'Live Call' ? 'Simulated practice' : 'Audited recording'} · {selectedItem.date}
            </span>
          </div>
        </div>
        <Scorecard 
          evaluation={selectedItem.evaluation} 
          onReset={() => setSelectedItem(null)} 
          audioId={selectedItem.id}
          audioUrl={selectedItem.audioUrl}
          conversationId={selectedItem.conversationId}
          scenarioTitle={`${selectedItem.companyName} (${selectedItem.contactName})`}
          difficulty={selectedItem.difficulty || selectedItem.evaluation?.difficulty}
        />
      </div>
    );
  }

  const totalCalls = filteredHistory.length;
  const averageScore = totalCalls > 0 
    ? Math.round(filteredHistory.reduce((acc, curr) => acc + curr.score, 0) / totalCalls) 
    : 0;
  const passedCalls = filteredHistory.filter(item => item.score >= 70).length;
  const passRate = totalCalls > 0 
    ? Math.round((passedCalls / totalCalls) * 100) 
    : 0;

  // Take the 10 most recent calls, and order them chronologically (oldest to newest) from left to right
  const chartItems = [...filteredHistory].slice(0, 10).reverse();

  const handleClear = () => {
    if (window.confirm("Do you want to permanently delete call history?")) {
      onClearHistory();
    }
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Delete this call record?")) {
      onDeleteHistoryItem?.(id);
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 bg-[#F4F6F9] overflow-y-auto space-y-6 text-left text-slate-900">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
                <Shield className="w-3 h-3" /> Team Supervision
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                <User className="w-3 h-3" /> My Progress
              </span>
            )}
          </div>

          <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">
            {isAdmin ? 'Commercial Team Performance Tracking' : 'My Practices & Evaluations'}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {isAdmin 
              ? 'Review practice calls conducted by each sales rep, listen to audio recordings, and manage user accounts.'
              : 'Review your past calls, listen to audio recordings, and check your improvement recommendations.'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowManageUsers(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer shadow-xs"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Manage Sales Reps</span>
            </button>
            {totalCalls > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-xl font-semibold text-xs border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Admin Filter Bar */}
      {isAdmin && traineesList.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter by sales rep:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedTraineeFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTraineeFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              All ({history.length})
            </button>
            {traineesList.map(t => (
              <button
                key={t.name}
                onClick={() => setSelectedTraineeFilter(t.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTraineeFilter === t.name
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <span>{t.name}</span>
                <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-md ${
                  selectedTraineeFilter === t.name ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Spend & Consumption Dashboard (Admin View) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-base">
                  Consumo y Gasto por Usuario (ElevenLabs AI)
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Monitoreo de minutos en llamada, créditos y gasto total en dólares por cada vendedor
                </p>
              </div>
            </div>

            {/* Metric Switcher */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl self-start lg:self-auto">
              <button
                onClick={() => setActiveSpendMetric('cost')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeSpendMetric === 'cost'
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gasto ($ USD)</span>
              </button>

              <button
                onClick={() => setActiveSpendMetric('minutes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeSpendMetric === 'minutes'
                    ? 'bg-white text-indigo-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Minutos</span>
              </button>

              <button
                onClick={() => setActiveSpendMetric('credits')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeSpendMetric === 'credits'
                    ? 'bg-white text-purple-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-purple-600" />
                <span>Créditos</span>
              </button>

              <button
                onClick={() => setActiveSpendMetric('calls')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeSpendMetric === 'calls'
                    ? 'bg-white text-amber-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                <span>Prácticas</span>
              </button>
            </div>
          </div>

          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border border-emerald-100 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-emerald-800 block">Gasto Total Empresa</span>
                <span className="text-xl font-display font-bold font-mono text-emerald-950">
                  ${companySummary.totalCostUsd.toFixed(2)} <span className="text-xs font-sans font-medium text-emerald-700">USD</span>
                </span>
                <span className="text-[11px] text-emerald-700 block mt-0.5">Prom. ${companySummary.avgCostPerCall.toFixed(2)} / práctica</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/80 to-blue-50/40 border border-indigo-100 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-indigo-800 block">Tiempo en Voz</span>
                <span className="text-xl font-display font-bold font-mono text-indigo-950">
                  {companySummary.totalMinutes} <span className="text-xs font-sans font-medium text-indigo-700">min</span>
                </span>
                <span className="text-[11px] text-indigo-700 block mt-0.5">~{companySummary.totalHours} hrs de simulación</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50/80 to-violet-50/40 border border-purple-100 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-purple-800 block">Créditos Consumidos</span>
                <span className="text-xl font-display font-bold font-mono text-purple-950">
                  {companySummary.totalCredits.toLocaleString()}
                </span>
                <span className="text-[11px] text-purple-700 block mt-0.5">ElevenLabs Platform & AI</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/80 to-orange-50/40 border border-amber-100 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-amber-800 block">Prácticas Realizadas</span>
                <span className="text-xl font-display font-bold font-mono text-amber-950">
                  {companySummary.totalCalls} <span className="text-xs font-sans font-medium text-amber-700">sesiones</span>
                </span>
                <span className="text-[11px] text-amber-700 block mt-0.5">Prom. {companySummary.avgMinutesPerCall} min / llamada</span>
              </div>
            </div>
          </div>

          {/* Comparative Horizontal Bar Chart */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
              <span>Distribución por Vendedor (clic para filtrar sesiones)</span>
              <span>
                {activeSpendMetric === 'cost' && 'Gasto Total ($ USD) · % del Total'}
                {activeSpendMetric === 'minutes' && 'Minutos en Llamada · % del Tiempo'}
                {activeSpendMetric === 'credits' && 'Créditos ElevenLabs'}
                {activeSpendMetric === 'calls' && 'Prácticas Realizadas'}
              </span>
            </div>

            <div className="space-y-2.5">
              {chartUserItems.map(user => {
                const currentVal = activeSpendMetric === 'cost' 
                  ? user.totalCostUsd 
                  : activeSpendMetric === 'minutes' 
                    ? user.totalMinutes 
                    : activeSpendMetric === 'credits' 
                      ? user.totalCredits 
                      : user.callCount;

                const percentWidth = Math.max(Math.round((currentVal / maxChartValue) * 100), 4);
                const isSelected = selectedTraineeFilter === user.name;

                return (
                  <div
                    key={user.name}
                    onClick={() => setSelectedTraineeFilter(user.name === selectedTraineeFilter ? 'ALL' : user.name)}
                    className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer group ${
                      isSelected 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-emerald-500/20' 
                        : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-slate-800 text-amber-400' : 'bg-white text-slate-800 border border-slate-200'
                        }`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                              {user.name}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {user.role === 'admin' ? 'Supervisor' : 'Sales Rep'}
                            </span>
                          </div>
                          <p className={`text-[11px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {user.callCount} {user.callCount === 1 ? 'práctica' : 'prácticas'} · {user.totalMinutes} min · prom. ${user.avgCostPerCall.toFixed(2)} / llamada
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`font-mono text-sm font-bold ${
                            isSelected ? 'text-emerald-400' : 'text-slate-900'
                          }`}>
                            {activeSpendMetric === 'cost' && `$${user.totalCostUsd.toFixed(2)} USD`}
                            {activeSpendMetric === 'minutes' && `${user.totalMinutes} min`}
                            {activeSpendMetric === 'credits' && `${user.totalCredits.toLocaleString()} cr`}
                            {activeSpendMetric === 'calls' && `${user.callCount} calls`}
                          </span>
                          <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded-full ${
                            isSelected 
                              ? 'bg-slate-800 text-emerald-300' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          }`}>
                            {user.percentageOfTotalCost}%
                          </span>
                        </div>
                        <span className={`text-[10px] block ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                          {activeSpendMetric !== 'cost' && `$${user.totalCostUsd.toFixed(2)} USD gastado`}
                          {activeSpendMetric === 'cost' && `${user.totalMinutes} min en llamada`}
                        </span>
                      </div>
                    </div>

                    {/* Proportional Progress Bar */}
                    <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          activeSpendMetric === 'cost'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            : activeSpendMetric === 'minutes'
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                              : activeSpendMetric === 'credits'
                                ? 'bg-gradient-to-r from-purple-500 to-violet-600'
                                : 'bg-gradient-to-r from-amber-500 to-orange-500'
                        }`}
                        style={{ width: `${percentWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Comparative Cards for Admin */}
      {isAdmin && selectedTraineeFilter === 'ALL' && traineesList.length > 1 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-display font-bold text-slate-900 text-sm">
              Sales Rep Overview
            </h3>
            <span className="text-xs text-slate-500">{traineesList.length} active reps</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {traineesList.map(trainee => (
              <div 
                key={trainee.name}
                onClick={() => setSelectedTraineeFilter(trainee.name)}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/60 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-display font-bold text-slate-900 text-sm truncate">
                      {trainee.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{trainee.count} {trainee.count === 1 ? 'practice call' : 'practice calls'}</p>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                    trainee.avgScore >= 80 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : trainee.avgScore >= 60 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {trainee.avgScore}/100
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1 mt-2.5 pt-2 border-t border-slate-200/60 text-xs">
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                    <DollarSign className="w-3 h-3 text-emerald-600" />
                    ${trainee.totalCostUsd.toFixed(2)} USD · {trainee.totalMinutes} min
                  </span>
                  <div className="flex items-center gap-1 text-blue-600 font-semibold text-xs">
                    <span>View sessions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalCalls === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/90 text-center space-y-4 flex flex-col items-center">
          <div className="p-4 bg-slate-100 text-slate-500 rounded-2xl">
            <BarChart className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base font-display font-bold text-slate-900">No sessions recorded yet</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Start a practice call or upload an audio recording to view your performance evaluations and listen to recorded calls.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md pt-2">
            <button
              onClick={() => onNavigateToMode('Live Call Simulation')}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-display font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Practice Call</span>
            </button>
            <button
              onClick={() => onNavigateToMode('Real Call Audit')}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Audit Recording</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Summary Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 flex items-center gap-4 shadow-xs">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium">
                  {selectedTraineeFilter === 'ALL' ? 'Average Score' : 'Sales Rep Average'}
                </p>
                <h4 className="text-2xl font-display font-bold font-mono text-slate-900 mt-0.5">
                  {averageScore} <span className="text-xs text-slate-400 font-sans font-normal">/ 100</span>
                </h4>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 flex items-center gap-4 shadow-xs">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium">
                  Completed Calls
                </p>
                <h4 className="text-2xl font-display font-bold font-mono text-slate-900 mt-0.5">
                  {totalCalls} <span className="text-xs text-slate-400 font-sans font-normal">{totalCalls === 1 ? 'call' : 'calls'}</span>
                </h4>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 flex items-center gap-4 shadow-xs">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium">
                  Passing Rate (≥70)
                </p>
                <h4 className="text-2xl font-display font-bold font-mono text-slate-900 mt-0.5">
                  {passRate}% <span className="text-xs text-slate-400 font-sans font-normal">({passedCalls} of {totalCalls})</span>
                </h4>
              </div>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-display font-bold text-slate-900 text-sm">
                Score Progression (Recent Sessions)
              </h3>
              {selectedTraineeFilter !== 'ALL' && (
                <span className="text-xs font-semibold text-blue-600">
                  Sales Rep: {selectedTraineeFilter}
                </span>
              )}
            </div>
            
            <div className="h-40 flex items-end justify-between gap-2 sm:gap-4 pt-4 border-b border-slate-200 px-3">
              {chartItems.map((item, idx) => (
                <div 
                  key={item.id} 
                  className="flex-1 flex flex-col items-center group h-full justify-end cursor-pointer" 
                  onClick={() => setSelectedItem(item)}
                >
                  <span className="text-[11px] font-mono font-bold text-slate-700 mb-1">
                    {item.score}
                  </span>
                  <div 
                    className="w-full max-w-[44px] rounded-t-lg transition-all duration-200 hover:opacity-85"
                    style={{ 
                      height: `${Math.max(item.score, 8)}%`,
                      backgroundColor: item.score >= 80 ? '#059669' : item.score >= 60 ? '#D97706' : '#DC2626'
                    }}
                  />
                  <span className="text-[11px] font-mono text-slate-400 mt-2 truncate w-full text-center">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sessions List */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-900 text-sm">
                Recorded Sessions
              </h3>
              <span className="text-xs text-slate-500">
                Click any session to review its evaluation and listen to the call
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {[...filteredHistory].map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      item.type === 'Live Call' 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/70' 
                        : 'bg-blue-50 text-blue-700 border border-blue-200/70'
                    }`}>
                      {item.type === 'Live Call' ? <PhoneCall className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                          {item.companyName}
                        </span>

                        {item.userName && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {item.userName}
                          </span>
                        )}

                        <span className="text-xs text-slate-500">
                          · {item.type === 'Live Call' ? 'Live voice call' : 'Uploaded recording'}
                        </span>

                        {(item.difficulty || item.evaluation?.difficulty) && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {item.difficulty === 'hardcore' || item.evaluation?.difficulty === 'hardcore'
                              ? 'Tough'
                              : item.difficulty === 'challenging' || item.evaluation?.difficulty === 'challenging'
                                ? 'Busy'
                                : 'Receptive'}
                          </span>
                        )}

                        {(item.hasAudio ?? true) && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Headphones className="w-3 h-3" /> Audio available
                          </span>
                        )}

                        {((item.durationSecs || 0) > 0 || (item.costUsd || 0) > 0) && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {Math.round((item.durationSecs || 0) / 60)} min
                            {(item.costUsd || 0) > 0 && (
                              <span className="text-emerald-700 font-semibold">· ${(item.costUsd || 0).toFixed(2)} USD</span>
                            )}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          Contact: {item.contactName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                    <span 
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                        item.score >= 80 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : item.score >= 60 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.score} / 100
                    </span>

                    {isAdmin && onDeleteHistoryItem && (
                      <button
                        onClick={(e) => handleDeleteItem(e, item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {showManageUsers && (
        <AdminUserManager onClose={() => setShowManageUsers(false)} />
      )}

    </div>
  );
}
