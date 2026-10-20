import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, Loader2, AlertCircle, FileCheck, ShieldCheck } from 'lucide-react';
import Scorecard from './Scorecard';
import { saveAudio } from './audioDb';

export default function RealCallAudit({ onEvaluationComplete }: { onEvaluationComplete?: (score: number, evaluation: any, contactName: string, companyName: string, opts?: { id?: string; hasAudio?: boolean; audioUrl?: string }) => void }) {
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
    setLoadingMessage("Leyendo archivo de audio local...");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = reader.result as string;
          const commaIndex = result.indexOf(',');
          const base64Data = commaIndex !== -1 ? result.substring(commaIndex + 1) : result;
          const mimeType = file.type || 'audio/mp3';

          setLoadingMessage("Analizando prospección con IA y transcribiendo...");

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
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 bg-slate-50 overflow-y-auto">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-6 text-left">
        
        {/* Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 border border-blue-100">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Auditoría de Llamada Real
            </h2>
            <p className="text-slate-500 text-xs">
              Sube la grabación de una llamada de prospección para evaluarla contra los guiones oficiales JYC
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-5 text-center">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-14 h-14 animate-spin text-blue-600" />
              <div className="absolute w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                <FileAudio className="w-4 h-4 text-blue-600 animate-pulse" />
              </div>
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-sm font-bold text-slate-900">{loadingMessage}</h3>
              <p className="text-slate-500 text-xs">
                Este proceso puede tardar unos segundos según la duración del audio. Por favor no cierres la ventana.
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
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50/30' 
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="audio/*"
                onChange={handleFileChange}
              />
              
              <div className="p-3 bg-slate-100 text-slate-500 rounded-lg">
                <FileAudio className="w-6 h-6" />
              </div>
              
              {file ? (
                <div className="text-center space-y-1">
                  <p className="font-semibold text-slate-900 text-xs flex items-center justify-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    {file.name}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <p className="font-semibold text-slate-800 text-xs">Arrastra y suelta tu archivo de audio aquí</p>
                  <p className="text-[11px] text-slate-400">Formatos compatibles: .mp3, .wav, .m4a hasta 25MB</p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-red-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleAudit}
              disabled={!file}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              Iniciar Auditoría y Evaluación
            </button>

            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Verificación de guiones: Bypass, Gancho, Calificación y Cierre</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
