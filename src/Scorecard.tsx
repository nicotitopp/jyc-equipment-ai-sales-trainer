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
  scenarioTitle?: string;
}

export default function Scorecard({ 
  evaluation, 
  onReset, 
  customTranscripts,
  audioId,
  audioBlob,
  audioUrl,
  conversationId,
  scenarioTitle
}: ScorecardProps) {
  const [showTranscript, setShowTranscript] = useState(false);

  const transcriptLines = evaluation.transcript || customTranscripts?.map(t => ({
    role: t.role,
    text: t.text
  })) || [];

  const effectiveAudioUrl = audioUrl || (conversationId ? `/api/elevenlabs/conversation-audio/${conversationId}` : undefined);
  const isPassing = evaluation.score >= 70;

  return (
    <div id="scorecard-print-area" className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-left text-slate-900">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className={`p-3.5 rounded-2xl shrink-0 border ${
            isPassing 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">
                Evaluación de la práctica
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isPassing 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {isPassing ? 'Objetivo cumplido' : 'Oportunidad de mejora'}
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              {scenarioTitle 
                ? `Escenario practicado: ${scenarioTitle}` 
                : 'Análisis de tu conversación comercial, calificación de maquinaria y manejo de objeciones'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 no-print shrink-0 w-full sm:w-auto">
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Descargar PDF</span>
          </button>
          <button
            onClick={onReset}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-display font-bold shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practicar de nuevo</span>
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
            title="Grabación de la llamada"
            subtitle="Escucha la conversación para repasar tu tono y tus respuestas"
          />
        </div>
      )}

      {/* Main Grid: Score & Stages (Left) + Detailed Coaching Feedback (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (4 cols): Score, Summary & Question Quality Checklist */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Score & Conversation Summary */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-slate-500 mb-3">
              Puntuación general
            </span>
            
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  className="text-slate-100"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  strokeWidth="10"
                  strokeDasharray={364}
                  strokeDashoffset={364 - (364 * Math.min(Math.max(evaluation.score, 0), 100)) / 100}
                  strokeLinecap="round"
                  stroke={
                    evaluation.score >= 80 
                      ? "#059669" 
                      : evaluation.score >= 60 
                        ? "#D97706" 
                        : "#DC2626"
                  }
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-display font-bold text-slate-900 font-mono">
                  {evaluation.score}
                </span>
                <span className="text-xs text-slate-400 font-medium">de 100</span>
              </div>
            </div>

            <div className="w-full border-t border-slate-100 pt-4 mt-4 text-left space-y-1.5">
              <div className="text-xs font-semibold text-slate-800">Resumen de la conversación</div>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {evaluation.summary}
              </p>
            </div>
          </div>

          {/* Quality of Questions & Call Stages */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm">
                  Etapas y preguntas realizadas
                </h3>
                <p className="text-xs text-slate-500">Estructura clave de la llamada</p>
              </div>
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            </div>
            
            <div className="space-y-2">
              {[
                { key: 'gatekeeperBypass', label: 'Superar recepción (filtro inicial)' },
                { key: 'kpOpening', label: 'Presentación y motivo con el responsable' },
                { key: 'equipmentQualification', label: 'Preguntas de calificación (marca, modelo, año)' },
                { key: 'futureReference', label: 'Preguntas de referencia (si hoy no vende)' },
                { key: 'priceAndAssets', label: 'Solicitud de precio estimado y fotografías' },
                { key: 'objectionHandling', label: 'Respuesta clara a las objeciones' },
                { key: 'nextStepsSecure', label: 'Acuerdo del siguiente paso o contacto directo' }
              ].map((item) => {
                const checked = (evaluation.checklist as any)?.[item.key] === true;
                return (
                  <div key={item.key} className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                    <span className="text-slate-700 font-medium pr-2 leading-snug">{item.label}</span>
                    <span className={`px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 shrink-0 ${
                      checked 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-200/70 text-slate-600'
                    }`}>
                      {checked ? (
                        <>
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>Sí</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 stroke-[2.5]" />
                          <span>Faltó</span>
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (8 cols): Strengths, Improvements, Objections, Recommendations, Transcript */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Strengths & Areas for Improvement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Aciertos */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-display font-bold text-sm border-b border-slate-100 pb-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <ThumbsUp className="w-4 h-4" />
                </div>
                <span>Aciertos en la llamada</span>
              </div>
              <ul className="space-y-2.5">
                {evaluation.strengths?.map((str: string, idx: number) => (
                  <li key={idx} className="text-slate-700 text-xs sm:text-sm flex items-start gap-2.5 leading-relaxed">
                    <span className="text-emerald-600 font-bold mt-0.5 select-none">•</span>
                    <span>{str}</span>
                  </li>
                ))}
                {(!evaluation.strengths || evaluation.strengths.length === 0) && (
                  <li className="text-slate-400 text-xs italic">No se registraron aciertos específicos en esta sesión.</li>
                )}
              </ul>
            </div>

            {/* Aspectos por mejorar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-amber-800 font-display font-bold text-sm border-b border-slate-100 pb-2.5">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <ThumbsDown className="w-4 h-4" />
                </div>
                <span>Aspectos por mejorar</span>
              </div>
              <ul className="space-y-2.5">
                {evaluation.weaknesses?.map((weak: string, idx: number) => (
                  <li key={idx} className="text-slate-700 text-xs sm:text-sm flex items-start gap-2.5 leading-relaxed">
                    <span className="text-amber-600 font-bold mt-0.5 select-none">•</span>
                    <span>{weak}</span>
                  </li>
                ))}
                {(!evaluation.weaknesses || evaluation.weaknesses.length === 0) && (
                  <li className="text-slate-400 text-xs italic">No se detectaron puntos débiles críticos.</li>
                )}
              </ul>
            </div>

          </div>

          {/* Manejo de Objeciones */}
          {evaluation.objectionsHandled && evaluation.objectionsHandled.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-display font-bold text-slate-900 text-sm">
                  Manejo de objeciones
                </h3>
                <p className="text-xs text-slate-500">Cómo respondiste a las dudas o resistencias del cliente</p>
              </div>
              <div className="space-y-3">
                {evaluation.objectionsHandled.map((obj: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm">{obj.objection}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        obj.handledWell 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {obj.handledWell ? <ThumbsUp className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {obj.handledWell ? 'Bien resuelta' : 'Por reforzar'}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{obj.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recomendaciones para la siguiente llamada */}
          {evaluation.recommendations && evaluation.recommendations.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-display font-bold text-slate-900 text-sm">
                  Recomendaciones para tu siguiente llamada
                </h3>
                <p className="text-xs text-slate-500">Consejos prácticos para aplicar en el próximo intento</p>
              </div>
              <div className="space-y-2.5">
                {evaluation.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
                    <div className="shrink-0 w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-xs mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-slate-700 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transcripción completa */}
          {transcriptLines.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="flex items-center gap-2 font-display font-bold text-slate-900 text-sm">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Transcripción de la conversación ({transcriptLines.length} intervenciones)
                </span>
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="no-print text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  {showTranscript ? 'Ocultar transcripción' : 'Ver transcripción'}
                  {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              <div className={`space-y-3 pt-1 max-h-[420px] overflow-y-auto print-always-visible ${showTranscript ? 'block' : 'hidden'}`}>
                {transcriptLines.map((msg: any, idx: number) => {
                  const isUser = msg.role === 'user' || msg.role === 'Trainee' || msg.role === 'Trainee (Sales Rep)' || msg.role === 'agent';
                  const roleLabel = isUser ? 'Tú (Comercial)' : 'Cliente';
                  return (
                    <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                        isUser 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        <div className={`text-[11px] font-semibold mb-0.5 ${
                          isUser ? 'text-blue-100' : 'text-slate-500'
                        }`}>
                          {roleLabel}
                        </div>
                        <div>{msg.text}</div>
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
