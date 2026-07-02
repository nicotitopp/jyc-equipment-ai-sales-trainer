import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, Loader2, FileText, AlertCircle } from 'lucide-react';
import Scorecard from './Scorecard';

export default function RealCallAudit() {
  const [file, setFile] = useState<File | null>(null);
  const [contactName, setContactName] = useState('Dave');
  const [companyName, setCompanyName] = useState('Pine Bluff Sand');
  const [language, setLanguage] = useState<'English' | 'Spanish'>('English');
  
  // Auditing States
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
        setError("Please upload an audio file (.mp3, .wav, .m4a)");
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
    setLoadingMessage("Reading audio file...");

    try {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const resultStr = reader.result as string;
          // Extract base64 part
          const base64Data = resultStr.split(',')[1];
          const mimeType = file.type || "audio/mp3";

          setLoadingMessage("Gemini is transcribing and auditing call script...");

          const response = await fetch('/api/audit-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Data,
              mimeType: mimeType,
              contactName: contactName || "Dave",
              companyName: companyName || "Pine Bluff Sand",
              language: language
            })
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Failed to analyze call audio');
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
              throw new Error("Invalid JSON response from auditor: " + text);
            }
          }

          setEvaluation(parsedData);
        } catch (err: any) {
          console.error("Audit error:", err);
          setError(err.message || "Failed to analyze audio file. Try again.");
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError("Failed to read local file.");
        setLoading(false);
      };

      reader.readAsDataURL(file);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  if (evaluation) {
    return (
      <Scorecard 
        evaluation={evaluation} 
        onReset={handleReset} 
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 bg-slate-50 overflow-y-auto">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Audit Real Call</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Upload an audio recording of a real cold call to get detailed script compliance feedback from Gemini.
          </p>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-6">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
              <div className="absolute w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <FileAudio className="w-5 h-5 text-blue-600 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2 max-w-md">
              <h3 className="text-xl font-bold text-slate-800 animate-pulse">{loadingMessage}</h3>
              <p className="text-slate-500 text-sm">
                This might take a minute depending on the length of the audio file. Please do not close this window.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Form Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Language / Idioma</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLanguage('English')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      language === 'English'
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('Spanish')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      language === 'Spanish'
                        ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Español
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Name (KP)</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Carlos"
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Pine Bluff Sand"
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

            </div>

            {/* Dropzone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerUploadClick}
              className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50/20' 
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
              
              <div className="p-4 bg-slate-100 text-slate-500 rounded-2xl">
                <FileAudio className="w-8 h-8" />
              </div>
              
              {file ? (
                <div className="text-center space-y-1">
                  <p className="font-semibold text-slate-800 text-sm">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <p className="font-semibold text-slate-800 text-sm">Drag and drop your audio recording</p>
                  <p className="text-xs text-slate-400">Supports .mp3, .wav, .m4a up to 15MB</p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleAudit}
              disabled={!file}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <UploadCloud className="w-4 h-4" />
              Audit Call Recording
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
