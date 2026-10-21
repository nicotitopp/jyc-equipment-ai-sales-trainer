import React, { useState } from 'react';
import { 
  Award, ChevronUp, ChevronDown, Check, X, 
  AlertTriangle, ThumbsUp, ThumbsDown, RotateCcw, FileText, Printer, ShieldCheck,
  CheckCircle2, XCircle, FileCheck, Sparkles, Terminal
} from 'lucide-react';
import AudioPlayer from './AudioPlayer';

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
  audioId?: string;
  audioBlob?: Blob | null;
  audioUrl?: string;
  conversationId?: string;
}

export default function Scorecard({ 
  evaluation, 
  onReset, 
  customTranscripts,
  audioId,
  audioBlob,
  audioUrl,
  conversationId 
}: ScorecardProps) {
  const [showTranscript, setShowTranscript] = useState(false);

  const transcriptLines = evaluation.transcript || customTranscripts?.map(t => ({
    role: t.role,
    text: t.text
  })) || [];

  const effectiveAudioUrl = audioUrl || (conversationId ? `/api/elevenlabs/conversation-audio/${conversationId}` : undefined);
  const isPassing = evaluation.score >= 70;

  return (
    <div id="scorecard-print-area" className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-5 text-left text-slate-100">
      
      {/* Top Header Card - Industrial Quality Inspection Certificate */}
      <div className="bg-[#0A0F17] rounded-2xl p-5 sm:p-6 border border-[#1E293B] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        
        {/* Glow ambient */}
        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 ${
          isPassing ? 'bg-emerald-500/10' : 'bg-amber-500/10'
        }`}></div>

        <div className="flex items-center gap-3.5 relative z-10">
          <div className={`p-3.5 rounded-xl shrink-0 border ${
            isPassing 
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
              : 'bg-amber-950/60 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
          }`}>
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-mono font-bold text-slate-100 tracking-tight uppercase">
                Certificado Técnico de Calidad de Llamada
              </h2>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                isPassing 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60' 
                  : 'bg-amber-950 text-amber-300 border-amber-700/60'
              }`}>
                {isPassing ? '● APROBADA (≥70 PTS)' : '○ REQUIERE REPASO (<70 PTS)'}
              </span>
            </div>
            <p className="text-slate-400 text-xs font-mono mt-0.5">
              Inspección técnica automatizada bajo los parámetros oficiales de prospección de maquinaria pesada JYC Equipment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 no-print shrink-0 w-full sm:w-auto relative z-10">
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0E1522] hover:bg-[#162032] text-slate-200 rounded-xl text-xs font-mono font-semibold border border-[#1E293B] hover:border-slate-600 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Descargar PDF</span>
          </button>
          <button
            onClick={onReset}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-mono font-bold shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nueva Simulación</span>
          </button>
        </div>
      </div>

      {/* Audio Player Bar */}
      {(audioId || audioBlob || effectiveAudioUrl) && (
        <div className="no-print">
          <AudioPlayer 
            audioId={audioId}
            audioBlob={audioBlob}
            audioUrl={effectiveAudioUrl}
            title="Grabación de la Llamada / Audio Auditado"
            subtitle="Reproduce la conversación con control de velocidad y scrubber táctil"
          />
        </div>
      )}

      {/* Main Grid: Score Column & Detailed Critique */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column: Overall Score & Checklist */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* Score Indicator */}
          <div className="bg-[#0A0F17] rounded-2xl p-5 border border-[#1E293B] shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-3">
              Índice de Rendimiento Comercial
            </span>
            
            {/* SVG Ring Progress with Dark Telemetry styling */}
            <div className="relative w-36 h-36 flex items-center justify-center my-1">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  className="text-[#0E1522]"
                  strokeWidth="9"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  strokeWidth="9"
                  strokeDasharray={364}
                  strokeDashoffset={364 - (364 * Math.min(Math.max(evaluation.score, 0), 100)) / 100}
                  strokeLinecap="round"
                  stroke={
                    evaluation.score >= 80 
                      ? "#10B981" 
                      : evaluation.score >= 60 
                        ? "#F59E0B" 
                        : "#EF4444"
                  }
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-slate-100 font-mono tracking-tight">
                  {evaluation.score}
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">/ 100 PTS</span>
              </div>
            </div>

            <div 
              className={`mt-2 px-3 py-1 rounded-lg text-xs font-bold uppercase font-mono tracking-wide border ${
                evaluation.score >= 80 
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60' 
                  : evaluation.score >= 60 
                    ? 'bg-amber-950/60 text-amber-300 border-amber-700/60' 
                    : 'bg-red-950/60 text-red-300 border-red-700/60'
              }`}
            >
              {evaluation.score >= 80 ? 'Excelente Desempeño' : evaluation.score >= 60 ? 'Nivel Aceptable' : 'Requiere Refuerzo'}
            </div>

            <p className="text-slate-300 text-xs leading-relaxed border-t border-[#1E293B] pt-3.5 mt-3.5 text-left w-full font-sans">
              {evaluation.summary}
            </p>
          </div>

          {/* Checklist */}
          <div className="bg-[#0A0F17] rounded-2xl p-5 border border-[#1E293B] shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <h3 className="font-mono font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Matriz de Cumplimiento Técnico
              </h3>
            </div>
            
            <div className="space-y-2">
              {[
                { key: 'gatekeeperBypass', label: 'Bypass de Operadora (Gatekeeper)' },
                { key: 'kpOpening', label: 'Apertura con Key Person (Gancho)' },
                { key: 'equipmentQualification', label: 'Calificación (Año, Marca, Capacidad)' },
                { key: 'futureReference', label: 'Preguntas de Referencia (Si no vende)' },
                { key: 'priceAndAssets', label: 'Expectativa de Precio & Fotos Placa' },
                { key: 'objectionHandling', label: 'Manejo Táctico de Objeciones' },
                { key: 'nextStepsSecure', label: 'Siguiente Paso & Datos Directos' }
              ].map((item) => {
                const checked = (evaluation.checklist as any)?.[item.key] === true;
                return (
                  <div key={item.key} className="flex items-center justify-between py-2 px-2.5 rounded-lg bg-[#080C14] border border-[#1E293B] text-xs">
                    <span className="text-slate-300 font-sans pr-2 leading-tight">{item.label}</span>
                    <span className={`p-1 rounded shrink-0 font-mono text-[10px] font-bold flex items-center gap-1 ${
                      checked 
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60' 
                        : 'bg-red-950/80 text-red-300 border border-red-700/60'
                    }`}>
                      {checked ? (
                        <>
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>PASS</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 stroke-[3]" />
                          <span>MISS</span>
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Strengths, Weaknesses, Objections & Transcript */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Strengths & Weaknesses 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Strengths */}
            <div className="bg-[#0A0F17] border border-emerald-900/60 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider border-b border-[#1E293B] pb-2">
                <ThumbsUp className="w-4 h-4 text-emerald-400" />
                <span>Fortalezas Observadas</span>
              </div>
              <ul className="space-y-2">
                {evaluation.strengths?.map((str: string, idx: number) => (
                  <li key={idx} className="text-slate-200 text-xs flex items-start gap-2 leading-relaxed font-sans">
                    <span className="text-emerald-400 font-bold select-none">•</span>
                    <span>{str}</span>
                  </li>
                ))}
                {(!evaluation.strengths || evaluation.strengths.length === 0) && (
                  <li className="text-slate-500 text-xs italic font-mono">No se registraron fortalezas específicas.</li>
                )}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-[#0A0F17] border border-rose-900/60 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs uppercase tracking-wider border-b border-[#1E293B] pb-2">
                <ThumbsDown className="w-4 h-4 text-rose-400" />
                <span>Áreas Críticas de Oportunidad</span>
              </div>
              <ul className="space-y-2">
                {evaluation.weaknesses?.map((weak: string, idx: number) => (
                  <li key={idx} className="text-slate-200 text-xs flex items-start gap-2 leading-relaxed font-sans">
                    <span className="text-rose-400 font-bold select-none">•</span>
                    <span>{weak}</span>
                  </li>
                ))}
                {(!evaluation.weaknesses || evaluation.weaknesses.length === 0) && (
                  <li className="text-slate-500 text-xs italic font-mono">No se registraron fallas relevantes.</li>
                )}
              </ul>
            </div>

          </div>

          {/* Objections Handled */}
          {evaluation.objectionsHandled && evaluation.objectionsHandled.length > 0 && (
            <div className="bg-[#0A0F17] rounded-2xl p-5 border border-[#1E293B] shadow-2xl space-y-3">
              <h3 className="font-mono font-bold text-slate-200 text-xs uppercase tracking-wider border-b border-[#1E293B] pb-2 flex items-center justify-between">
                <span>Auditoría de Objeciones Presentadas</span>
                <span className="text-[10px] text-cyan-400">{evaluation.objectionsHandled.length} analizadas</span>
              </h3>
              <div className="space-y-3">
                {evaluation.objectionsHandled.map((obj: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#080C14] border border-[#1E293B] space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-mono font-bold text-slate-100 text-xs">{obj.objection}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        obj.handledWell 
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' 
                          : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                      }`}>
                        {obj.handledWell ? <ThumbsUp className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {obj.handledWell ? 'BIEN RESUELTA' : 'REQUIERE REFUERZO'}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed font-sans">{obj.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {evaluation.recommendations && evaluation.recommendations.length > 0 && (
            <div className="bg-[#0A0F17] rounded-2xl p-5 border border-[#1E293B] shadow-2xl space-y-3">
              <h3 className="font-mono font-bold text-slate-200 text-xs uppercase tracking-wider border-b border-[#1E293B] pb-2">
                Recomendaciones Tácticas & Flujo Correcto de Guion
              </h3>
              <div className="space-y-2.5">
                {evaluation.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs p-2.5 rounded-lg bg-[#080C14] border border-[#1E293B]">
                    <div className="shrink-0 w-5 h-5 rounded bg-cyan-950 border border-cyan-700/60 text-cyan-300 flex items-center justify-center font-mono font-bold text-[10px] mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-slate-300 leading-relaxed font-sans">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transcript Section */}
          {transcriptLines.length > 0 && (
            <div className="bg-[#0A0F17] rounded-2xl p-5 border border-[#1E293B] shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                <span className="flex items-center gap-2 font-mono font-bold text-slate-200 text-xs uppercase tracking-wider">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Transcripción Forense del Diálogo ({transcriptLines.length} turnos)
                </span>
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="no-print text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  {showTranscript ? 'Ocultar' : 'Expandir Diálogo'}
                  {showTranscript ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className={`space-y-2.5 pt-1 max-h-[420px] overflow-y-auto custom-scrollbar print-always-visible ${showTranscript ? 'block' : 'hidden'}`}>
                {transcriptLines.map((msg: any, idx: number) => {
                  const isUser = msg.role === 'user' || msg.role === 'Trainee' || msg.role === 'Trainee (Sales Rep)' || msg.role === 'agent';
                  const roleLabel = isUser ? 'VENDEDOR' : 'PROSPECTO';
                  return (
                    <div key={idx} className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                      <span className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase h-5 flex items-center border ${
                        isUser 
                          ? 'bg-blue-950/80 text-blue-300 border-blue-700/60' 
                          : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                      }`}>
                        {roleLabel}
                      </span>
                      <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs text-left leading-relaxed ${
                          isUser 
                            ? 'bg-blue-600/20 border border-blue-500/40 text-blue-100 font-sans' 
                            : 'bg-[#0E1522] border border-[#1E293B] text-slate-200 font-sans'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}