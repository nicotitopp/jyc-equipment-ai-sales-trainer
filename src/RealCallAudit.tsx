import React, { useState, useRef } from 'react';
import { 
  UploadCloud, FileAudio, Loader2, AlertCircle, FileCheck, ShieldCheck, 
  Activity, Radio, CheckCircle2, ArrowRight, Zap, FileText
} from 'lucide-react';
import Scorecard from './Scorecard';
import { saveAudio } from './audioDb';

export default function RealCallAudit({ 
  onEvaluationComplete 
}: { 
  onEvaluationComplete?: (
    score: number, 
    evaluation: any, 
    contactName: string, 
    companyName: string, 
    opts?: { id?: string; hasAudio?: boolean; audioUrl?: string }
  ) => void 
}) {
  const [file, setFile] = useState<File | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingStep, setLoadingStep] = useState(1);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('audio/') || droppedFile.name.endsWith('.mp3') || droppedFile.name.endsWith('.wav') || droppedFile.name.endsWith('.m4a')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Por favor sube un archivo de audio válido (.mp3, .wav, .m4a).");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setFile(null);
    setEvaluation(null);
    setError(null);
    setLoading(false);
  };

  const handleAudit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setLoadingStep(1);
    setLoadingMessage("Leyendo archivo de audio local...");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = reader.result as string;
          const commaIndex = result.indexOf(',');
          const base64Data = commaIndex !== -1 ? result.substring(commaIndex + 1) : result;
          const mimeType = file.type || 'audio/mp3';

          setLoadingStep(2);
          setLoadingMessage("Transcribiendo onda acústica con IA de alta precisión...");

          let response;
          let retries = 3;
          let lastErr: any;

          while (retries > 0) {
            try {
              if (retries < 3) {
                setLoadingMessage(`Reintentando conexión con servidor (${4 - retries}/3)...`);
              }
              response = await fetch('/api/audit-audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audioBase64: base64Data,
                  mimeType: mimeType
                })
              });

              if (response.ok) break;

              if ([502, 503, 504, 429].includes(response.status) && retries > 1) {
                retries--;
                await new Promise(r => setTimeout(r, 2500));
                continue;
              }
              break;
            } catch (fetchErr: any) {
              lastErr = fetchErr;
              retries--;
              if (retries > 0) {
                await new Promise(r => setTimeout(r, 3000));
                continue;
              }
              throw fetchErr;
            }
          }

          if (!response) {
            throw lastErr || new Error("No se pudo conectar al servidor tras varios intentos.");
          }

          setLoadingStep(3);
          setLoadingMessage("Auditando contra matriz técnica JYC (Bypass, Gancho y Calificación)...");

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Fallo al analizar el audio de la llamada');
          }

          const text = data.text;
          let parsedData;
          try {
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedData = JSON.parse(cleanText);
          } catch (err) {
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
              parsedData = JSON.parse(text.substring(start, end + 1));
            } else {
              throw new Error("Respuesta JSON no válida del auditor: " + text);
            }
          }

          const auditId = Date.now().toString() + Math.random().toString().substring(2, 6);
          setCurrentId(auditId);
          let serverAudioUrl = `/api/audios/${auditId}`;

          if (file) {
            try {
              await saveAudio(auditId, file);
            } catch (saveErr) {
              console.warn("Could not save audio to IDB:", saveErr);
            }

            try {
              const uploadRes = await fetch('/api/audios/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: auditId,
                  audioBase64: base64Data,
                  mimeType: file.type || 'audio/mp3'
                })
              });
              if (uploadRes.ok) {
                const uploadData = await uploadRes.json();
                if (uploadData.audioUrl) {
                  serverAudioUrl = uploadData.audioUrl;
                }
              }
            } catch (uploadErr) {
              console.warn("Could not sync audio with server storage:", uploadErr);
            }
          }

          setEvaluation(parsedData);
          onEvaluationComplete?.(
            parsedData.score, 
            parsedData, 
            parsedData.contactName || "No identificado", 
            parsedData.companyName || "Empresa Prospecto", 
            { id: auditId, hasAudio: true, audioUrl: serverAudioUrl }
          );
          setLoading(false);

        } catch (err: any) {
          console.error("Audit error:", err);
          setError(err.message || "No se pudo procesar el archivo de audio. Intenta nuevamente.");
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError("Error al leer el archivo local.");
        setLoading(false);
      };

      reader.readAsDataURL(file);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error inesperado.");
      setLoading(false);
    }
  };

  if (evaluation) {
    return (
      <Scorecard 
        evaluation={evaluation} 
        onReset={handleReset} 
        audioBlob={file}
        audioId={currentId || undefined}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 bg-[#06090E] overflow-y-auto text-left">
      <div className="max-w-2xl w-full bg-[#0A0F17] rounded-2xl shadow-2xl border border-[#1E293B] p-6 sm:p-8 space-y-6 relative overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        {/* Header HUD */}
        <div className="flex items-start justify-between border-b border-[#1E293B] pb-5 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-cyan-950/60 text-cyan-400 rounded-xl flex items-center justify-center shrink-0 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-mono font-bold text-slate-100 tracking-tight uppercase">
                  Laboratorio Forense de Auditoría de Audio
                </h2>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  MOD-03
                </span>
              </div>
              <p className="text-slate-400 text-xs font-mono mt-0.5">
                Evaluación cognitiva de llamadas grabadas contra los 7 estándares de prospección JYC
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center relative z-10">
            {/* Radar / Scanning Visualizer */}
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-cyan-500/30 animate-ping absolute"></div>
              <div className="w-20 h-20 rounded-full border border-cyan-500/50 flex items-center justify-center bg-cyan-950/40">
                <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
              </div>
              <div className="absolute w-8 h-8 rounded-full bg-[#080C14] flex items-center justify-center border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                <Activity className="w-4 h-4 text-cyan-300 animate-pulse" />
              </div>
            </div>

            {/* Stepper info */}
            <div className="space-y-2 max-w-md">
              <div className="flex items-center justify-center gap-2 font-mono text-[10px] text-cyan-400">
                <span className={`px-2 py-0.5 rounded ${loadingStep >= 1 ? 'bg-cyan-950 border border-cyan-600 text-cyan-200' : 'bg-slate-800 text-slate-500'}`}>01. DECODE</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className={`px-2 py-0.5 rounded ${loadingStep >= 2 ? 'bg-cyan-950 border border-cyan-600 text-cyan-200' : 'bg-slate-800 text-slate-500'}`}>02. TRANSCRIBE</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className={`px-2 py-0.5 rounded ${loadingStep >= 3 ? 'bg-cyan-950 border border-cyan-600 text-cyan-200' : 'bg-slate-800 text-slate-500'}`}>03. AUDIT</span>
              </div>

              <h3 className="text-sm font-mono font-bold text-slate-100">{loadingMessage}</h3>
              <p className="text-slate-400 text-xs font-mono">
                Extrayendo métricas de prospección con Gemini 2.5 Cognitive Engine...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5 relative z-10">
            
            {/* Tactical Dropzone with reticle corners */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerUploadClick}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3.5 cursor-pointer transition-all relative group ${
                dragActive 
                  ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]' 
                  : file 
                    ? 'border-emerald-500/60 bg-[#0E1522]'
                    : 'border-[#1E293B] bg-[#080C14] hover:border-cyan-500/50 hover:bg-[#0C121D]'
              }`}
            >
              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-slate-600 group-hover:border-cyan-400 transition-colors"></div>
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-slate-600 group-hover:border-cyan-400 transition-colors"></div>
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-slate-600 group-hover:border-cyan-400 transition-colors"></div>
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-slate-600 group-hover:border-cyan-400 transition-colors"></div>

              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="audio/*"
                onChange={handleFileChange}
              />
              
              <div className={`p-3.5 rounded-xl border transition-colors ${
                file 
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/50' 
                  : 'bg-slate-900 text-cyan-400 border-[#1E293B] group-hover:border-cyan-500/40'
              }`}>
                {file ? <FileCheck className="w-7 h-7" /> : <FileAudio className="w-7 h-7" />}
              </div>
              
              {file ? (
                <div className="text-center space-y-1">
                  <p className="font-mono font-bold text-slate-100 text-xs sm:text-sm flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {file.name}
                  </p>
                  <p className="text-[11px] font-mono text-cyan-300">
                    PESO: {(file.size / (1024 * 1024)).toFixed(2)} MB • FORMATO: {file.type || 'audio/mp3'}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 pt-1">
                    [Archivo listo para inyección al motor de auditoría]
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-1.5">
                  <p className="font-mono font-bold text-slate-200 text-xs sm:text-sm">
                    Arrastra y suelta tu archivo de audio aquí
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">
                    Formatos compatibles: .mp3, .wav, .m4a hasta 25MB
                  </p>
                  <span className="inline-block mt-1 px-2.5 py-1 rounded bg-[#111A29] border border-[#1E293B] text-[10px] font-mono text-cyan-400">
                    O haz clic para explorar tu disco local
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl flex items-center gap-2.5 text-red-300 text-xs font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              onClick={handleAudit}
              disabled={!file}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-mono font-bold text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>EJECUTAR AUDITORÍA COGNITIVA & EVALUACIÓN</span>
            </button>

            {/* Verification checklist pills */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400 border-t border-[#1E293B]">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Verificación automatizada de 4 fases:
              </span>
              <div className="flex flex-wrap gap-2 text-[9px]">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">1. BYPASS</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">2. GANCHO</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">3. 7 PREGUNTAS</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">4. CIERRE</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}