import React, { useState, useEffect } from 'react';
import { 
  Award, ChevronUp, ChevronDown, Check, X, 
  AlertTriangle, ThumbsUp, ThumbsDown, RotateCcw, FileText, Printer, ShieldCheck,
  Headphones, Download, ExternalLink, Gauge
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
    difficulty?: string;
  };
  onReset: () => void;
  customTranscripts?: { id: number | string; role: string; text: string }[];
  audioId?: string;
  audioBlob?: Blob | null;
  audioUrl?: string;
  conversationId?: string;
  scenarioTitle?: string;
  difficulty?: string;
}

export default function Scorecard({ 
  evaluation, 
  onReset, 
  customTranscripts,
  audioId,
  audioBlob,
  audioUrl,
  conversationId,
  scenarioTitle,
  difficulty
}: ScorecardProps) {
  const [showTranscript, setShowTranscript] = useState(false);

  const transcriptLines = evaluation.transcript || customTranscripts?.map(t => ({
    role: t.role,
    text: t.text
  })) || [];

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const relativeAudioPath = audioUrl 
    || (conversationId ? `/api/elevenlabs/conversation-audio/${conversationId}` : undefined)
    || (audioId ? `/api/audios/${audioId}` : undefined);

  const effectiveAudioUrl = relativeAudioPath;
  const fullAudioDownloadUrl = relativeAudioPath 
    ? (relativeAudioPath.startsWith('http') ? relativeAudioPath : `${origin}${relativeAudioPath}`)
    : undefined;

  const isPassing = evaluation.score >= 70;

  const effectiveDifficulty = difficulty 
    || (evaluation as any)?.difficulty 
    || (scenarioTitle && !scenarioTitle.toLowerCase().includes('audit') ? 'friendly' : undefined);

  const difficultyConfig = effectiveDifficulty === 'hardcore'
    ? { label: 'Tough', badge: 'bg-rose-50 text-rose-700 border-rose-200', textClass: 'text-rose-700' }
    : effectiveDifficulty === 'challenging'
      ? { label: 'Busy', badge: 'bg-amber-50 text-amber-700 border-amber-200', textClass: 'text-amber-700' }
      : effectiveDifficulty === 'friendly'
        ? { label: 'Receptive', badge: 'bg-blue-50 text-blue-700 border-blue-200', textClass: 'text-blue-700' }
        : effectiveDifficulty
          ? { label: effectiveDifficulty, badge: 'bg-slate-50 text-slate-700 border-slate-200', textClass: 'text-slate-800' }
          : null;

  const handleDownloadPdf = () => {
    // 1. Force transcript to be expanded in React DOM before printing
    setShowTranscript(true);
    document.body.classList.add('is-printing-pdf');

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('is-printing-pdf');
      }, 1000);
    }, 150);
  };

  useEffect(() => {
    const onBefore = () => {
      setShowTranscript(true);
      document.body.classList.add('is-printing-pdf');
    };
    const onAfter = () => {
      document.body.classList.remove('is-printing-pdf');
    };

    window.addEventListener('beforeprint', onBefore);
    window.addEventListener('afterprint', onAfter);
    return () => {
      window.removeEventListener('beforeprint', onBefore);
      window.removeEventListener('afterprint', onAfter);
    };
  }, []);

  return (
    <div id="scorecard-print-area" className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-left text-slate-900">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print-avoid-break">
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
                Practice Call Evaluation
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isPassing 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {isPassing ? 'Objective Achieved' : 'Opportunity to Improve'}
              </span>

              {difficultyConfig && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${difficultyConfig.badge}`}>
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Difficulty: {difficultyConfig.label}</span>
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              {scenarioTitle 
                ? `Practiced scenario: ${scenarioTitle}` 
                : 'Analysis of your sales dialogue, equipment qualification, and objection handling'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 no-print shrink-0 w-full sm:w-auto">
          <button
            onClick={handleDownloadPdf}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={onReset}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-display font-bold shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Again</span>
          </button>
        </div>
      </div>

      {/* Interactive Audio Player Bar (Screen only) */}
      {(audioId || audioBlob || effectiveAudioUrl) && (
        <div className="no-print">
          <AudioPlayer 
            audioId={audioId}
            audioBlob={audioBlob}
            audioUrl={effectiveAudioUrl}
            title="Call Recording"
            subtitle="Listen to the conversation to review your tone and responses"
          />
        </div>
      )}

      {/* Audio Recording Download Link (PDF Export Only - Hidden on web screen) */}
      {fullAudioDownloadUrl && (
        <div className="hidden print:block print-only bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs print-avoid-break">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-slate-900">
                Call Audio Recording (MP3)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Two-way audio dialogue between sales rep and prospect
              </p>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-1 text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              Download Audio Link (Clickable in PDF):
            </span>
            <a
              href={fullAudioDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-mono text-[11px] break-all select-all font-medium"
            >
              {fullAudioDownloadUrl}
            </a>
            <span className="text-[10px] text-slate-500 mt-0.5">
              Click the link above in this PDF or copy the URL into your browser to download the complete audio file.
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Score & Stages (Left) + Detailed Coaching Feedback (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (4 cols): Score, Summary & Question Quality Checklist */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Score & Conversation Summary */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-slate-500 mb-3">
              Overall Score
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
                <span className="text-xs text-slate-400 font-medium">out of 100</span>
              </div>
            </div>

            {/* Selected Difficulty Badge in Overall Score Card */}
            {difficultyConfig && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-slate-50 border-slate-200">
                <Gauge className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-500 font-medium">Difficulty:</span>
                <span className={`font-bold ${difficultyConfig.textClass}`}>{difficultyConfig.label}</span>
              </div>
            )}

            <div className="w-full border-t border-slate-100 pt-4 mt-4 text-left space-y-1.5">
              <div className="text-xs font-semibold text-slate-800">Executive Summary</div>
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
                  Call Stages & Questions Asked
                </h3>
                <p className="text-xs text-slate-500">Key structure of the call</p>
              </div>
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            </div>
            
            <div className="space-y-2">
              {[
                { key: 'gatekeeperBypass', label: 'Gatekeeper bypass (reception filter)' },
                { key: 'kpOpening', label: 'Introduction & purpose with key person' },
                { key: 'equipmentQualification', label: 'Qualification questions (make, model, year)' },
                { key: 'futureReference', label: 'Future reference questions (if not selling today)' },
                { key: 'priceAndAssets', label: 'Price expectation & photo/plate request' },
                { key: 'objectionHandling', label: 'Clear objection handling' },
                { key: 'nextStepsSecure', label: 'Agreed next step or direct contact' }
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
                          <span>Yes</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 stroke-[2.5]" />
                          <span>Missed</span>
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
                <span>Call Strengths</span>
              </div>
              <ul className="space-y-2.5">
                {evaluation.strengths?.map((str: string, idx: number) => (
                  <li key={idx} className="text-slate-700 text-xs sm:text-sm flex items-start gap-2.5 leading-relaxed">
                    <span className="text-emerald-600 font-bold mt-0.5 select-none">•</span>
                    <span>{str}</span>
                  </li>
                ))}
                {(!evaluation.strengths || evaluation.strengths.length === 0) && (
                  <li className="text-slate-400 text-xs italic">No specific strengths recorded in this session.</li>
                )}
              </ul>
            </div>

            {/* Aspectos por mejorar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-amber-800 font-display font-bold text-sm border-b border-slate-100 pb-2.5">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <ThumbsDown className="w-4 h-4" />
                </div>
                <span>Areas for Improvement</span>
              </div>
              <ul className="space-y-2.5">
                {evaluation.weaknesses?.map((weak: string, idx: number) => (
                  <li key={idx} className="text-slate-700 text-xs sm:text-sm flex items-start gap-2.5 leading-relaxed">
                    <span className="text-amber-600 font-bold mt-0.5 select-none">•</span>
                    <span>{weak}</span>
                  </li>
                ))}
                {(!evaluation.weaknesses || evaluation.weaknesses.length === 0) && (
                  <li className="text-slate-400 text-xs italic">No critical weaknesses detected.</li>
                )}
              </ul>
            </div>

          </div>

          {/* Manejo de Objeciones */}
          {evaluation.objectionsHandled && evaluation.objectionsHandled.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-display font-bold text-slate-900 text-sm">
                  Objection Handling
                </h3>
                <p className="text-xs text-slate-500">How you addressed prospect concerns or resistance</p>
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
                        {obj.handledWell ? 'Handled well' : 'Needs work'}
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
                  Recommendations for your next call
                </h3>
                <p className="text-xs text-slate-500">Actionable advice to apply on your next attempt</p>
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

          {/* Full Conversation Transcript (Forced onto Page 2+ in PDF and fully readable) */}
          {transcriptLines.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4 print-break-before print-avoid-break">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="flex items-center gap-2 font-display font-bold text-slate-900 text-sm">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Full Conversation Transcript ({transcriptLines.length} turns)
                </span>
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="no-print text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  {showTranscript ? 'Hide transcript' : 'Show transcript'}
                  {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              <div className={`scorecard-transcript-body space-y-3 pt-1 max-h-[460px] overflow-y-auto print-always-visible print:max-h-none print:overflow-visible ${showTranscript ? 'block' : 'hidden print:block'}`}>
                {transcriptLines.map((msg: any, idx: number) => {
                  const isUser = msg.role === 'user' || msg.role === 'Trainee' || msg.role === 'Trainee (Sales Rep)' || msg.role === 'agent';
                  const roleLabel = isUser ? 'You (Sales Rep)' : 'Prospect';
                  return (
                    <div key={idx} className={`print-dialogue-turn flex ${isUser ? 'justify-end print:justify-start' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed border print:max-w-full print:w-full ${
                        isUser 
                          ? 'bg-blue-600 text-white border-blue-600 print:bg-blue-50/70 print:text-slate-900 print:border-l-4 print:border-l-blue-600 print:border-slate-200' 
                          : 'bg-slate-100 text-slate-800 border-slate-200 print:bg-slate-50 print:border-l-4 print:border-l-slate-400 print:border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between gap-2 mb-1 border-b border-white/20 print:border-slate-200 pb-1">
                          <span className={`text-[11px] font-bold ${
                            isUser ? 'text-blue-100 print:text-blue-800' : 'text-slate-600 print:text-slate-800'
                          }`}>
                            {roleLabel}
                          </span>
                          <span className="text-[10px] opacity-70 font-mono">
                            Turn #{idx + 1}
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap">{msg.text}</div>
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
