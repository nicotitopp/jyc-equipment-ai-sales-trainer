import React, { useState } from 'react';
import { 
  Award, ChevronUp, ChevronDown, Check, X, 
  AlertTriangle, ThumbsUp, ThumbsDown, RotateCcw, FileText, Printer, ShieldCheck
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
    <div id="scorecard-print-area" className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-5 text-left">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-xl shrink-0 ${
            isPassing ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Auditoría Técnica de Llamada
              </h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                isPassing ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isPassing ? 'APROBADA' : 'REQUIERE REPASO'}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5 font-medium">
              Evaluación automatizada conforme a los criterios de prospección de maquinaria pesada JYC Equipment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 no-print shrink-0 w-full sm:w-auto">
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Descargar PDF
          </button>
          <button
            onClick={onReset}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Nueva Simulación
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
            subtitle="Reproduce la conversación con control de velocidad y scrubber"
          />
        </div>
      )}

      {/* Main Grid: Score Column & Detailed Critique */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column: Overall Score & Checklist */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* Score Indicator */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col items-center text-center">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-3">
              Puntaje de Rendimiento
            </span>
            
            {/* SVG Ring Progress */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  className="text-slate-100"
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
                <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {evaluation.score}
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">/ 100 PTS</span>
              </div>
            </div>

            <div 
              className={`mt-3 px-3 py-1 rounded-md text-xs font-bold uppercase font-mono tracking-wide ${
                evaluation.score >= 80 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : evaluation.score >= 60 
                    ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {evaluation.score >= 80 ? 'Excelente' : evaluation.score >= 60 ? 'Aceptable' : 'Por Mejorar'}
            </div>

            <p className="text-slate-600 text-xs leading-relaxed border-t border-slate-100 pt-3.5 mt-3.5 text-left w-full">
              {evaluation.summary}
            </p>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                Lista de Verificación
              </h3>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            
            <div className="space-y-2">
              {[
                { key: 'gatekeeperBypass', label: 'Bypass de Operador / Filtro' },
                { key: 'kpOpening', label: 'Apertura con Key Person (Gancho)' },
                { key: 'equipmentQualification', label: 'Calificación de Equipo (Año/Marca/Horas)' },
                { key: 'futureReference', label: 'Preguntas de Referencia (Si no vende)' },
                { key: 'priceAndAssets', label: 'Petición de Precio Pretendido & Fotos' },
                { key: 'objectionHandling', label: 'Manejo de Objeciones (Playbook)' },
                { key: 'nextStepsSecure', label: 'Contacto Directo & Siguiente Paso' }
              ].map((item) => {
                const checked = (evaluation.checklist as any)?.[item.key] === true;
                return (
                  <div key={item.key} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors text-xs">
                    <span className="text-slate-700 font-medium pr-2 leading-tight">{item.label}</span>
                    <span className={`p-1 rounded-md shrink-0 ${
                      checked ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {checked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 stroke-[3]" />}
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
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wide">
                <ThumbsUp className="w-4 h-4 text-emerald-600" />
                <span>Puntos Fuertes</span>
              </div>
              <ul className="space-y-2">
                {evaluation.strengths?.map((str: string, idx: number) => (
                  <li key={idx} className="text-slate-800 text-xs flex items-start gap-2 leading-relaxed">
                    <span className="text-emerald-600 font-bold select-none">•</span>
                    <span>{str}</span>
                  </li>
                ))}
                {(!evaluation.strengths || evaluation.strengths.length === 0) && (
                  <li className="text-slate-400 text-xs italic">No se registraron fortalezas específicas.</li>
                )}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wide">
                <ThumbsDown className="w-4 h-4 text-rose-600" />
                <span>Áreas de Oportunidad</span>
              </div>
              <ul className="space-y-2">
                {evaluation.weaknesses?.map((weak: string, idx: number) => (
                  <li key={idx} className="text-slate-800 text-xs flex items-start gap-2 leading-relaxed">
                    <span className="text-rose-600 font-bold select-none">•</span>
                    <span>{weak}</span>
                  </li>
                ))}
                {(!evaluation.weaknesses || evaluation.weaknesses.length === 0) && (
                  <li className="text-slate-400 text-xs italic">No se registraron debilidades relevantes.</li>
                )}
              </ul>
            </div>

          </div>

          {/* Objections Handled */}
          {evaluation.objectionsHandled && evaluation.objectionsHandled.length > 0 && (
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2">
                Evaluación de Objeciones Respondidas
              </h3>
              <div className="space-y-3">
                {evaluation.objectionsHandled.map((obj: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{obj.objection}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        obj.handledWell 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {obj.handledWell ? <ThumbsUp className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {obj.handledWell ? 'Bien Resuelta' : 'Requiere Reforzar'}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{obj.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {evaluation.recommendations && evaluation.recommendations.length > 0 && (
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-2">
                Recomendaciones & Flujo Correcto de Guion
              </h3>
              <div className="space-y-2.5">
                {evaluation.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <div className="shrink-0 w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-[10px] mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-slate-700 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transcript Section */}
          {transcriptLines.length > 0 && (
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wide">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Transcripción Completa del Diálogo ({transcriptLines.length} líneas)
                </span>
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="no-print text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  {showTranscript ? 'Ocultar' : 'Ver Diálogo'}
                  {showTranscript ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className={`space-y-2.5 pt-1 max-h-[380px] overflow-y-auto print-always-visible ${showTranscript ? 'block' : 'hidden'}`}>
                {transcriptLines.map((msg: any, idx: number) => {
                  const isUser = msg.role === 'user' || msg.role === 'Trainee' || msg.role === 'Trainee (Sales Rep)' || msg.role === 'agent';
                  const roleLabel = isUser ? 'VENDEDOR' : 'PROSPECTO';
                  return (
                    <div key={idx} className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                      <span className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase h-5 flex items-center ${
                        isUser ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {roleLabel}
                      </span>
                      <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-xs text-left leading-relaxed ${
                          isUser ? 'bg-blue-600 text-white font-medium' : 'bg-slate-100 text-slate-800'
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
