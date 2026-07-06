import React, { useState } from 'react';
import { HistoryItem } from './types';
import Scorecard from './Scorecard';
import { 
  BarChart, Calendar, Award, User, Briefcase, 
  Trash2, ArrowRight, Play, Upload, MessageSquare, AlertCircle, Check
} from 'lucide-react';

interface HistoryDashboardProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onNavigateToMode: (mode: 'Live Call Simulation' | 'Real Call Audit') => void;
}

export default function HistoryDashboard({ history, onClearHistory, onNavigateToMode }: HistoryDashboardProps) {
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  if (selectedItem) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center justify-between no-print">
          <button 
            onClick={() => setSelectedItem(null)}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            ← Back to History Dashboard
          </button>
          <span className="text-xs text-slate-500 font-medium">
            Archived {selectedItem.type} Audit - {selectedItem.date}
          </span>
        </div>
        <Scorecard 
          evaluation={selectedItem.evaluation} 
          onReset={() => setSelectedItem(null)} 
        />
      </div>
    );
  }

  // Calculate KPIs
  const totalCalls = history.length;
  const averageScore = totalCalls > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / totalCalls) 
    : 0;
  const passedCalls = history.filter(item => item.score >= 70).length;
  const passRate = totalCalls > 0 
    ? Math.round((passedCalls / totalCalls) * 100) 
    : 0;

  // Last 10 items for the chart
  const chartItems = [...history].slice(-10);

  const handleClear = () => {
    if (window.confirm("Are you sure you want to permanently clear all call history?")) {
      onClearHistory();
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 bg-slate-50 overflow-y-auto space-y-6 text-left">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Training History</h2>
          <p className="text-slate-500 text-sm mt-0.5">Track your progress and review previous call scorecards</p>
        </div>
        {totalCalls > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-xs border border-red-200 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear History
          </button>
        )}
      </div>

      {totalCalls === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-6 flex flex-col items-center">
          <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl">
            <BarChart className="w-10 h-10" />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-lg font-bold text-slate-800">No calls recorded yet</h3>
            <p className="text-slate-500 text-sm">
              Your scorecard logs will be saved locally as soon as you complete a live simulation or upload an audio audit.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md pt-2">
            <button
              onClick={() => onNavigateToMode('Live Call Simulation')}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Practice Live Call
            </button>
            <button
              onClick={() => onNavigateToMode('Real Call Audit')}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Audit Call Audio
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
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Average Score</p>
                <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{averageScore} <span className="text-xs text-slate-400 font-semibold">/100</span></h4>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Audited</p>
                <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{totalCalls} <span className="text-xs text-slate-400 font-semibold">calls</span></h4>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pass Rate (&gt;=70)</p>
                <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{passRate}% <span className="text-xs text-slate-400 font-semibold">({passedCalls}/{totalCalls})</span></h4>
              </div>
            </div>

          </div>

          {/* Progress Chart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Score Progress Trend (Last 10 calls)</h3>
            
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
              <span>← Older Calls</span>
              <span>Newest Calls →</span>
            </div>
          </div>

          {/* List of Previous Audits */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <h3 className="font-bold text-slate-800 text-sm p-6 border-b border-slate-100">Audit History Log</h3>
            <div className="divide-y divide-slate-100">
              {[...history].reverse().map((item) => (
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
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">
                          {item.companyName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase">
                          {item.type}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {item.contactName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-bold uppercase">Score</span>
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
                    <ArrowRight className="w-5 h-5 text-slate-300 hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
