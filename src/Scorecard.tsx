import React, { useState } from 'react';
import { 
  Award, ChevronUp, ChevronDown, Check, X, 
  AlertTriangle, ThumbsUp, ThumbsDown, RotateCcw, FileText
} from 'lucide-react';

interface ScorecardProps {
  evaluation: {
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    checklist: {
      gatekeeperBypass: boolean;
      kpOpening: boolean;
      equipmentQualification: boolean;
      futureReference: boolean;
      priceAndAssets: boolean;
      objectionHandling: boolean;
      nextStepsSecure: boolean;
    };
    objectionsHandled: { objection: string; handledWell: boolean; feedback: string }[];
    recommendations: string[];
    transcript?: { role: string; text: string }[];
  };
  onReset: () => void;
  customTranscripts?: { id: number | string; role: string; text: string }[];
}

export default function Scorecard({ evaluation, onReset, customTranscripts }: ScorecardProps) {
  const [showTranscript, setShowTranscript] = useState(false);

  // Normalize transcript list
  const transcriptLines = evaluation.transcript || customTranscripts?.map(t => ({
    role: t.role,
    text: t.text
  })) || [];

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 bg-slate-50 overflow-y-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Call Performance Scorecard</h2>
            <p className="text-slate-500 text-sm mt-0.5">Automated AI critique based on construction sales guidelines</p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Analyze Another Call
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Score & Summary Column */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Score Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col items-center text-center space-y-4">
            <h3 className="font-bold text-slate-700 text-sm tracking-wider uppercase">Overall Score</h3>
            
            {/* SVG Ring Progress */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Circle */}
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  className="text-slate-100"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                />
                {/* Foreground Circle */}
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  strokeWidth="10"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (377 * Math.min(Math.max(evaluation.score, 0), 100)) / 100}
                  strokeLinecap="round"
                  stroke={
                    evaluation.score >= 80 
                      ? "#10B981" // emerald-500
                      : evaluation.score >= 60 
                        ? "#F59E0B" // amber-500
                        : "#EF4444" // red-500
                  }
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-slate-900">{evaluation.score}</span>
                <span className="text-xs text-slate-400 font-semibold uppercase">/ 100</span>
              </div>
            </div>

            <div className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-700"
              style={{
                backgroundColor: evaluation.score >= 80 ? '#ECFDF5' : evaluation.score >= 60 ? '#FFFBEB' : '#FEF2F2',
                color: evaluation.score >= 80 ? '#047857' : evaluation.score >= 60 ? '#B45309' : '#B91C1C'
              }}
            >
              {evaluation.score >= 80 ? 'Excellent' : evaluation.score >= 60 ? 'Satisfactory' : 'Needs Improvement'}
            </div>

            <p className="text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4 w-full">
              {evaluation.summary}
            </p>
          </div>

          {/* Qualification Checklist */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Sales Process Checklist</h3>
            
            <div className="space-y-3">
              {[
                { key: 'gatekeeperBypass', label: 'Bypass de Operador / KP' },
                { key: 'kpOpening', label: 'Apertura con KP y Gancho' },
                { key: 'equipmentQualification', label: 'Calificación de Equipo (Si hay)' },
                { key: 'futureReference', label: 'Preguntas de Referencia (Si no hay)' },
                { key: 'priceAndAssets', label: 'Precio Pretendido e Imágenes' },
                { key: 'objectionHandling', label: 'Manejo de Objeciones (Script)' },
                { key: 'nextStepsSecure', label: 'Contacto y Siguientes Pasos' }
              ].map((item) => {
                const checked = (evaluation.checklist as any)?.[item.key] === true;
                return (
                  <div key={item.key} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 text-left pr-2">{item.label}</span>
                    <div className={`p-1 rounded-full shrink-0 ${checked ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                      {checked ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Critique Details Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths Card */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <ThumbsUp className="w-5 h-5" />
                <span>What Went Well</span>
              </div>
              <ul className="space-y-2">
                {evaluation.strengths?.map((str: string, idx: number) => (
                  <li key={idx} className="text-slate-700 text-sm flex gap-2">
                    <span className="text-emerald-500 font-bold select-none">•</span>
                    <span>{str}</span>
                  </li>
                ))}
                {(!evaluation.strengths || evaluation.strengths.length === 0) && (
                  <li className="text-slate-400 text-sm italic">No significant strengths recorded.</li>
                )}
              </ul>
            </div>

            {/* Weaknesses Card */}
            <div className="bg-rose-50/50 border border-rose-100 rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold">
                <ThumbsDown className="w-5 h-5" />
                <span>Areas for Improvement</span>
              </div>
              <ul className="space-y-2">
                {evaluation.weaknesses?.map((weak: string, idx: number) => (
                  <li key={idx} className="text-slate-700 text-sm flex gap-2">
                    <span className="text-rose-400 font-bold select-none">•</span>
                    <span>{weak}</span>
                  </li>
                ))}
                {(!evaluation.weaknesses || evaluation.weaknesses.length === 0) && (
                  <li className="text-slate-400 text-sm italic">No specific weaknesses recorded.</li>
                )}
              </ul>
            </div>

          </div>

          {/* Objections Handled Feedback */}
          {evaluation.objectionsHandled && evaluation.objectionsHandled.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Objection Handling Review</h3>
              <div className="space-y-4">
                {evaluation.objectionsHandled.map((obj: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm">{obj.objection}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        obj.handledWell 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {obj.handledWell ? <ThumbsUp className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {obj.handledWell ? 'Handled Well' : 'Needs Practice'}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{obj.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Recommendations */}
          {evaluation.recommendations && evaluation.recommendations.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Recommendations & Correct script flow</h3>
              <div className="space-y-3">
                {evaluation.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View Transcript Toggle */}
          {transcriptLines.length > 0 && (
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="w-full flex items-center justify-between text-slate-700 font-medium px-2 py-1 text-sm hover:text-slate-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Review Call Transcript ({transcriptLines.length} lines)
                </span>
                {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTranscript && (
                <div className="mt-4 border-t border-slate-100 pt-4 max-h-[300px] overflow-y-auto space-y-3">
                  {transcriptLines.map((msg: any, idx: number) => {
                    const isUser = msg.role === 'user' || msg.role === 'Trainee' || msg.role === 'Trainee (Sales Rep)';
                    return (
                      <div key={idx} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                        <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${isUser ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-600'}`}>
                          {isUser ? 'U' : 'P'}
                        </div>
                        <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
                          <div className={`inline-block max-w-[85%] rounded-2xl px-3.5 py-1.5 text-xs text-left ${isUser ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
