import React, { useState, useRef } from 'react';
import { 
  UploadCloud, FileAudio, Loader2, AlertCircle, FileCheck, ShieldCheck
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
        setError("Selecciona un archivo de audio compatible (.mp3, .wav o .m4a).");
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
    setLoadingMessage("Preparando archivo de audio...");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = reader.result as string;
          const commaIndex = result.indexOf(',');
          const base64Data = commaIndex !== -1 ? result.substring(commaIndex + 1) : result;
          const mimeType = file.type || 'audio/mp3';

          setLoadingMessage("Transcribiendo la llamada y analizando la conversación...");

          let response;
          let retries = 3;
          let lastErr: any;

          while (retries > 0) {
            try {
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

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'No fue posible analizar el audio de la llamada.');
          }

          const text = data.text;
          let parsedData;
          try {
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedData = JSON.parse(cleanText);
          } catch {
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
              parsedData = JSON.parse(text.substring(start, end + 1));
            } else {
              throw new Error("Respuesta no válida del evaluador.");
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
            parsedData.companyName || "Empresa cliente", 
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
        setError("Error al leer el archivo seleccionado.");
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
      <div className="flex-1 overflow-y-auto bg-[#F4F6F9]">
        <Scorecard 
          evaluation={evaluation} 
          onReset={handleReset} 
          audioBlob={file}
          audioId={currentId || undefined}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 bg-[#F4F6F9] overflow-y-auto text-left">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xs border border-slate-200/90 p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-slate-900 tracking-tight">
              Evaluar grabación de llamada real
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Sube el audio de una llamada telefónica para analizar cómo se realizó el filtro en recepción, la calificación de maquinaria y el manejo de objeciones.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-base font-display font-bold text-slate-900">{loadingMessage}</h3>
              <p className="text-slate-500 text-xs sm:text-sm">
                Esto toma unos segundos dependiendo de la duración de la llamada.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* Dropzone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerUploadClick}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50/40' 
                  : file 
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="audio/*"
                onChange={handleFileChange}
              />
              
              <div className={`p-3.5 rounded-xl ${
                file ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-slate-200 text-slate-500'
              }`}>
                {file ? <FileCheck className="w-6 h-6" /> : <FileAudio className="w-6 h-6" />}
              </div>
              
              {file ? (
                <div className="text-center space-y-1">
                  <p className="font-semibold text-slate-900 text-sm">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB · Haz clic para cambiar de archivo
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <p className="font-semibold text-slate-800 text-sm">
                    Arrastra tu grabación aquí o haz clic para seleccionarla
                  </p>
                  <p className="text-xs text-slate-500">
                    Formatos compatibles: .mp3, .wav, .m4a (hasta 25 MB)
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleAudit}
              disabled={!file}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 rounded-xl font-display font-bold text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Analizar y calificar llamada</span>
            </button>

            <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500 border-t border-slate-100">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Evalúa filtro en recepción, apertura con responsable, las 7 preguntas y cierre</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
