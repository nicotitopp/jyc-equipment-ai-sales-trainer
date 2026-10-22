import React, { useState, useMemo } from 'react';
import { HistoryItem, User as UserType } from './types';
import Scorecard from './Scorecard';
import AdminUserManager from './AdminUserManager';
import { 
  BarChart, Calendar, Award, User, 
  Trash2, ArrowRight, Play, Upload, Check, Headphones,
  Shield, Filter, Users, ChevronRight, PhoneCall
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

  const traineesList = useMemo(() => {
    const map = new Map<string, { name: string; count: number; totalScore: number }>();
    for (const item of history) {
      const name = item.userName || 'Sales Rep';
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

  const chartItems = [...filteredHistory].slice(-10);

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
                <div className="flex items-center justify-end gap-1 mt-2 text-xs font-semibold text-blue-600">
                  <span>View sessions</span>
                  <ChevronRight className="w-3.5 h-3.5" />
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
                  <span className="text-xs font-mono font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
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
