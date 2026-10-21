import React, { useState, useRef, useEffect } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { 
  PhoneCall, Phone, Mic, MicOff, Loader2, Bot, User, ShieldCheck, 
  Radio, Activity, Cpu, Sparkles, CheckCircle2, AlertTriangle, Layers
} from 'lucide-react';
import Scorecard from './Scorecard';
import { saveAudio } from './audioDb';

interface TranscriptItem {
  id: number;
  role: 'user' | 'agent' | 'ai';
  text: string;
}

const ElevenLabsCallView = ({ onEvaluationComplete }: { onEvaluationComplete?: (score: number, evaluation: any, contactName: string, companyName: string, opts?: { id?: string; hasAudio?: boolean; conversationId?: string; audioUrl?: string }) => void }) => {
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Audio Recording States
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Configuration States
  const [difficulty, setDifficulty] = useState<'friendly' | 'challenging' | 'hardcore'>('friendly');
  const [language, setLanguage] = useState<'English' | 'Spanish'>('English');
  const [industry, setIndustry] = useState<string>('concrete');
  const [contactName, setContactName] = useState('Carlos');
  const [companyName, setCompanyName] = useState('Canteras del Norte');
  const [noiseSuppressionEnabled, setNoiseSuppressionEnabled] = useState(true);

  // Industry-specific defaults for quick configuration
  const INDUSTRY_DEFAULTS: Record<string, { 
    English: { company: string; contact: string }; 
    Spanish: { company: string; contact: string }; 
  }> = {
    concrete: {
      English: { company: "Northern Quarries", contact: "Charles" },
      Spanish: { company: "Canteras del Norte", contact: "Carlos" }
    },
    sand_gravel: {
      English: { company: "Pioneer Sand & Gravel", contact: "Tyler" },
      Spanish: { company: "Áridos y Gravas del Norte", contact: "Mateo" }
    },
    lumber: {
      English: { company: "Timberlands Sawmill", contact: "Robert" },
      Spanish: { company: "Maderas del Bosque", contact: "Roberto" }
    },
    metal: {
      English: { company: "Apex Steel Tubing", contact: "Edward" },
      Spanish: { company: "Aceros Industriales", contact: "Eduardo" }
    },
    ports: {
      English: { company: "Pacific Port Terminals", contact: "Frank" },
      Spanish: { company: "Terminal Portuaria del Pacífico", contact: "Francisco" }
    },
    plastic: {
      English: { company: "Matrix Plastics", contact: "Sophie" },
      Spanish: { company: "Plásticos y Polímeros", contact: "Sofía" }
    },
    medical: {
      English: { company: "BioPharma Logistics", contact: "Sarah" },
      Spanish: { company: "Distribuidora Médica Nacional", contact: "Elena" }
    }
  };

  useEffect(() => {
    const defaults = INDUSTRY_DEFAULTS[industry]?.[language] || INDUSTRY_DEFAULTS.concrete[language];
    setCompanyName(defaults.company);
    setContactName(defaults.contact);
  }, [industry, language]);

  // Evaluation States
  const [wasConnected, setWasConnected] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);

  // Call timer state
  const [callDuration, setCallDuration] = useState(0);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const conversation = useConversation({
    onConnect: ({ conversationId }: { conversationId?: string } = {}) => {
      if (conversationId) {
        setCurrentConversationId(conversationId);
      }
    },
    onMessage: (msg) => {
      setTranscripts(prev => [...prev, {
        id: Date.now() + Math.random(),
        role: msg.role || msg.source,
        text: msg.message
      }]);
    }
  });

  const isConnected = conversation.status === "connected";
  const isConnecting = conversation.status === "connecting";

  // Call timer effect
  useEffect(() => {
    let interval: any;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  // Watch for session ending to trigger evaluation automatically
  useEffect(() => {
    if (isConnected) {
      setWasConnected(true);
      setEvaluation(null);
      setShowEvaluation(false);
    } else if (wasConnected && !isConnected && conversation.status === "disconnected") {
      setWasConnected(false);
      if (transcripts.length > 0) {
        triggerEvaluation();
      }
    }
  }, [isConnected, conversation.status, wasConnected, transcripts.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  const handleStartCall = async () => {
    try {
      setTranscripts([]);
      const callId = Date.now().toString() + Math.random().toString().substring(2, 6);
      setCurrentCallId(callId);
      audioChunksRef.current = [];

      // Setup microphone stream
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            noiseSuppression: noiseSuppressionEnabled,
            echoCancellation: true,
            autoGainControl: true
          }
        });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          try {
            await saveAudio(callId, audioBlob);
          } catch (saveErr) {
            console.warn("Could not cache call audio to IDB:", saveErr);
          }
          stream.getTracks().forEach(t => t.stop());
        };

        recorder.start(1000);
      } catch (micErr) {
        console.warn("MediaRecorder mic access error:", micErr);
      }

      // Get signed URL from backend
      const res = await fetch('/api/elevenlabs/signed-url');
      if (!res.ok) {
        throw new Error("No se pudo obtener URL de conexión de ElevenLabs");
      }
      const data = await res.json();
      const signedUrl = data.signedUrl;

      // Start session with dynamic variables
      await conversation.startSession({
        signedUrl,
        dynamicVariables: {
          difficulty,
          language,
          industry,
          companyName,
          contactName
        }
      });
    } catch (err: any) {
      console.error("Start call error:", err);
      alert(`Error iniciando llamada: ${err.message || 'Verifica tu conexión y permisos de micrófono.'}`);
    }
  };

  const handleEndCall = async () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      await conversation.endSession();
    } catch (err) {
      console.error("End call error:", err);
    }
  };

  const handleResetCall = () => {
    setShowEvaluation(false);
    setEvaluation(null);
    setTranscripts([]);
    setCurrentCallId(null);
    setCurrentConversationId(null);
  };

  const triggerEvaluation = async () => {
    setShowEvaluation(true);
    setEvaluating(true);

    try {
      const dialogueText = transcripts.map(t => `${t.role === 'user' ? 'Trainee' : 'Prospect'}: ${t.text}`).join('\n');

      const prompt = `You are an expert sales performance auditor specializing in heavy industrial machinery acquisitions for JYC Equipment.
Audit the following live sales call between our trainee and a prospect.
Evaluate if the trainee adhered strictly to the JYC equipment buying playbook.

Language spoken in call: ${language}
Target Company: ${companyName}
Target Contact (Key Person): ${contactName}
Difficulty setting: ${difficulty}

Dialogue Transcript:
${dialogueText}

Please write all output critique fields (summary, strengths, weaknesses, objections feedback, recommendations) in Spanish.

Output strictly valid JSON with this exact schema:
{
  "score": number, // 0 to 100
  "contactName": "${contactName}",
  "companyName": "${companyName}",
  "summary": "Resumen ejecutivo en español...",
  "strengths": ["Fortaleza 1", "Fortaleza 2"],
  "weaknesses": ["Área a mejorar 1", "Área a mejorar 2"],
  "checklist": {
    "gatekeeperBypass": boolean,
    "kpOpening": boolean,
    "equipmentQualification": boolean,
    "futureReference": boolean,
    "priceAndAssets": boolean,
    "objectionHandling": boolean,
    "nextStepsSecure": boolean
  },
  "objectionsHandled": [
    { "objection": "Nombre de la objeción", "handledWell": boolean, "feedback": "Retroalimentación" }
  ],
  "recommendations": ["Recomendación 1", "Recomendación 2"]
}`;

      let response;
      let retries = 3;
      let lastErr: any;

      while (retries > 0) {
        try {
          response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{ role: 'user', content: prompt }],
              systemInstruction: "You are a strict, professional heavy machinery sales auditor. Return ONLY a valid JSON object matching the requested schema. No markdown backticks, just raw JSON."
            })
          });
          if (response.ok) break;
          retries--;
          await new Promise(r => setTimeout(r, 2000));
        } catch (fetchErr) {
          lastErr = fetchErr;
          retries--;
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      if (!response) throw lastErr || new Error("Fallo de comunicación con Gemini");
      const data = await response.json();
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
          throw new Error("Respuesta inválida del evaluador IA");
        }
      }

      const normalizedTranscript = transcripts.map(t => ({
        role: t.role === 'user' ? 'user' : 'prospect',
        text: t.text
      }));

      const fullEvaluation = {
        ...parsedData,
        transcript: parsedData.transcript || normalizedTranscript
      };

      setEvaluation(fullEvaluation);
      onEvaluationComplete?.(
        fullEvaluation.score,
        fullEvaluation,
        contactName,
        companyName,
        {
          id: currentCallId || undefined,
          hasAudio: true,
          conversationId: currentConversationId || undefined,
          audioUrl: currentConversationId ? `/api/elevenlabs/conversation-audio/${currentConversationId}` : undefined
        }
      );
    } catch (err: any) {
      console.error("Evaluation error:", err);
      setEvaluation({
        score: 0,
        summary: "No fue posible generar la evaluación automatizada: " + err.message,
        strengths: [],
        weaknesses: [err.message],
        checklist: {
          gatekeeperBypass: false,
          kpOpening: false,
          equipmentQualification: false,
          futureReference: false,
          priceAndAssets: false,
          objectionHandling: false,
          nextStepsSecure: false
        },
        objectionsHandled: [],
        recommendations: ["Comprueba tu conexión e intenta de nuevo."]
      });
    } finally {
      setEvaluating(false);
    }
  };

  if (showEvaluation) {
    if (evaluating) {
      return (
        <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 bg-[#080B10] flex items-center justify-center">
          <div className="bg-[#0E141D] rounded-xl p-12 border border-[#1E293B] shadow-2xl flex flex-col items-center justify-center space-y-5 max-w-lg text-center">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-14 h-14 animate-spin text-amber-500" />
              <div className="absolute w-9 h-9 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30">
                <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-white">
                AUDITORÍA DE LLAMADA EN PROCESO
              </h3>
              <p className="text-slate-400 text-xs font-mono leading-relaxed">
                Gemini está analizando la transcripción contra los 7 criterios oficiales del Playbook JYC: Bypass, Apertura KP, Calificación, Objeciones y Cierre.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return evaluation && (
      <Scorecard 
        evaluation={evaluation} 
        onReset={handleResetCall} 
        customTranscripts={transcripts} 
        audioId={currentCallId || undefined}
        conversationId={currentConversationId || undefined}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-3 sm:p-5 bg-[#080B10] bg-industrial-grid overflow-hidden">
      <div className="max-w-6xl w-full flex flex-col md:flex-row h-full gap-4">
        
        {/* Left Column: Flight / Call Director Panel */}
        <div className="md:w-[350px] bg-[#0C1118] rounded-xl border border-[#1C2634] p-4 text-left space-y-4 shrink-0 flex flex-col justify-between overflow-y-auto max-h-full shadow-xl">
          
          <div className="space-y-4">
            {/* Header Deck */}
            <div className="border-b border-[#1A2332] pb-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <h2 className="text-sm font-bold font-display uppercase tracking-wider text-white">
                    CENTRO DE TELEFONÍA
                  </h2>
                </div>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  SIMULADOR CONTEXTUAL DE PROSPECCIÓN
                </p>
              </div>
              <div className="px-2 py-0.5 rounded bg-[#131B26] border border-[#232F42] text-[9px] font-mono font-bold text-amber-300">
                ELEVENLABS VOX
              </div>
            </div>

            {/* Config Form (Only accessible before call) */}
            {!isConnected && !isConnecting && (
              <div className="space-y-3.5">
                
                {/* Sector Industrial */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                    <span>SECTOR INDUSTRIAL TARGET</span>
                    <span className="text-sky-400 font-semibold">{industry.toUpperCase()}</span>
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full text-xs font-semibold bg-[#111822] border border-[#222E40] text-slate-200 rounded p-2 focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="concrete">🏗️ Concreto & Prefabricados (Canteras)</option>
                    <option value="sand_gravel">⛰️ Áridos, Arena & Grava</option>
                    <option value="metal">⚙️ Siderúrgica, Acero & Tuberías</option>
                    <option value="ports">🚢 Puertos & Terminales de Contenedores</option>
                    <option value="plastic">🧪 Plásticos & Inyección de Moldes</option>
                    <option value="lumber">🪵 Aserraderos & Madereras</option>
                    <option value="medical">🏥 Logística Médica & Farmacéutica</option>
                  </select>
                </div>

                {/* Target Company & KP Dossier */}
                <div className="p-2.5 rounded bg-[#0F1621] border border-[#1E293B] space-y-2">
                  <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
                    <span>DOSSIER DE LA EMPRESA</span>
                    <span className="text-emerald-400 text-[8px] border border-emerald-500/30 px-1 rounded">VERIFICADO</span>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-slate-400 uppercase block">Empresa a Prospeccionar</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full text-xs font-mono font-semibold bg-[#0A0E15] border border-[#222E40] text-white rounded px-2.5 py-1.5 mt-0.5 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-slate-400 uppercase block">Key Person (Jefe de Planta / Operaciones)</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full text-xs font-mono font-semibold bg-[#0A0E15] border border-[#222E40] text-white rounded px-2.5 py-1.5 mt-0.5 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Idioma & Dificultad */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block mb-1">Idioma</label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setLanguage('English')}
                        className={`flex-1 py-1 rounded text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
                          language === 'English'
                            ? 'bg-blue-900/40 border-blue-500 text-blue-300'
                            : 'bg-[#111822] border-[#222E40] text-slate-400 hover:text-white'
                        }`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => setLanguage('Spanish')}
                        className={`flex-1 py-1 rounded text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
                          language === 'Spanish'
                            ? 'bg-amber-900/40 border-amber-500 text-amber-300'
                            : 'bg-[#111822] border-[#222E40] text-slate-400 hover:text-white'
                        }`}
                      >
                        ES
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block mb-1">Dificultad</label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setDifficulty('friendly')}
                        className={`flex-1 py-1 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                          difficulty === 'friendly'
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                            : 'bg-[#111822] border-[#222E40] text-slate-400'
                        }`}
                        title="Amable: receptivo y con 1 objeción sencilla"
                      >
                        BAJA
                      </button>
                      <button
                        onClick={() => setDifficulty('challenging')}
                        className={`flex-1 py-1 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                          difficulty === 'challenging'
                            ? 'bg-amber-950 border-amber-500 text-amber-300'
                            : 'bg-[#111822] border-[#222E40] text-slate-400'
                        }`}
                        title="Media: operador ocupado pidiendo precio inicial"
                      >
                        MEDIA
                      </button>
                      <button
                        onClick={() => setDifficulty('hardcore')}
                        className={`flex-1 py-1 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                          difficulty === 'hardcore'
                            ? 'bg-rose-950 border-rose-500 text-rose-300'
                            : 'bg-[#111822] border-[#222E40] text-slate-400'
                        }`}
                        title="Alta: hostil, objeciones múltiples y desconfianza"
                      >
                        ALTA
                      </button>
                    </div>
                  </div>
                </div>

                {/* DSP Noise Cancellation */}
                <div className="flex items-center justify-between p-2 rounded bg-[#0A0F17] border border-[#1A2332]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-4 h-4 ${noiseSuppressionEnabled ? 'text-sky-400' : 'text-slate-600'}`} />
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-200 block">Filtro DSP Antirruido</span>
                      <span className="text-[9px] font-mono text-slate-500 block">Cancela teclado y eco ambiental</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNoiseSuppressionEnabled(!noiseSuppressionEnabled)}
                    className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out ${
                      noiseSuppressionEnabled ? 'bg-sky-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                        noiseSuppressionEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

              </div>
            )}

            {/* In-Call Telemetry Status */}
            {isConnected && (
              <div className="p-3 rounded-lg bg-[#0E1521] border border-sky-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
                      FRECUENCIA ACTIVA
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-white/10">
                    {formatDuration(callDuration)}
                  </span>
                </div>

                <div className="text-center py-2">
                  {conversation.isSpeaking ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1.5 h-6">
                        <span className="w-1 bg-amber-400 rounded-full animate-waveform-1" />
                        <span className="w-1 bg-amber-400 rounded-full animate-waveform-2" />
                        <span className="w-1 bg-amber-400 rounded-full animate-waveform-3" />
                        <span className="w-1 bg-amber-400 rounded-full animate-waveform-4" />
                        <span className="w-1 bg-amber-400 rounded-full animate-waveform-5" />
                      </div>
                      <p className="text-[11px] font-mono font-bold text-amber-300">EL PROSPECTO ESTÁ HABLANDO</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1.5 text-sky-400">
                        <Mic className="w-4 h-4 animate-pulse" />
                        <span className="text-[11px] font-mono font-bold">TU TURNO AL MICRÓFONO</span>
                      </div>
                      <p className="text-[9px] font-mono text-slate-400">Escuchando transmisión del vendedor...</p>
                    </div>
                  )}
                </div>

                <div className="text-[10px] font-mono text-slate-400 border-t border-sky-900/40 pt-2 flex items-center justify-between">
                  <span>OBJETIVO:</span>
                  <span className="text-white font-bold">{companyName}</span>
                </div>
              </div>
            )}
          </div>

          {/* Trigger Button Area */}
          <div className="pt-3 border-t border-[#1A2332]">
            {!isConnected && !isConnecting && (
              <button
                onClick={handleStartCall}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-display font-black text-xs uppercase tracking-wider rounded transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>INICIAR SIMULACIÓN TELEFÓNICA</span>
              </button>
            )}

            {isConnecting && (
              <div className="w-full py-3 bg-[#131B26] border border-[#232F42] text-amber-400 font-mono text-xs flex items-center justify-center gap-2 rounded animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>ESTABLECIENDO CONEXIÓN WEBRTC...</span>
              </div>
            )}

            {isConnected && (
              <button
                onClick={handleEndCall}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-display font-black text-xs uppercase tracking-wider rounded transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Phone className="w-4 h-4 fill-current rotate-[135deg]" />
                <span>FINALIZAR LLAMADA Y AUDITAR</span>
              </button>
            )}
          </div>

        </div>

        {/* Right Column: Audio Transcript & Live Operator HUD */}
        <div className="md:flex-1 bg-[#0A0E15] rounded-xl border border-[#1C2634] overflow-hidden flex flex-col min-h-0 text-left shadow-xl">
          
          {/* Top HUD Telemetry Strip */}
          <div className="px-4 py-2.5 border-b border-[#1A2332] bg-[#0E131C] shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold font-display uppercase tracking-wider text-white flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                REGISTRO DE TRANSMISIÓN DE VOZ
              </span>
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                {transcripts.length} {transcripts.length === 1 ? 'línea' : 'líneas'}
              </span>
            </div>

            {/* Live Playbook Quick Reference Indicators */}
            <div className="hidden lg:flex items-center gap-1.5 text-[9px] font-mono">
              <span className="text-slate-500">QUALIFY CHECK:</span>
              <span className="px-1.5 py-0.5 rounded bg-[#121924] border border-[#1F2B3D] text-slate-300">TIPO</span>
              <span className="px-1.5 py-0.5 rounded bg-[#121924] border border-[#1F2B3D] text-slate-300">MODELO</span>
              <span className="px-1.5 py-0.5 rounded bg-[#121924] border border-[#1F2B3D] text-slate-300">MARCA</span>
              <span className="px-1.5 py-0.5 rounded bg-[#121924] border border-[#1F2B3D] text-slate-300">AÑO</span>
              <span className="px-1.5 py-0.5 rounded bg-[#121924] border border-[#1F2B3D] text-amber-300">PRECIO</span>
            </div>
          </div>

          {/* Transcript Dialogue Scrollable Stream */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 dark-scrollbar">
            {transcripts.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center space-y-3 p-8">
                 <div className="w-12 h-12 rounded bg-[#0F1622] border border-[#1E293B] flex items-center justify-center text-slate-400">
                   <PhoneCall className="w-6 h-6 text-amber-400" />
                 </div>
                 <div className="space-y-1 max-w-sm">
                   <h3 className="font-display font-bold text-slate-300 text-sm uppercase tracking-wide">
                     Canal de Audio en Espera
                   </h3>
                   <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
                     Configura el sector industrial y presiona "Iniciar Simulación Telefónica" para enlazar la llamada con el agente de IA.
                   </p>
                 </div>
               </div>
            ) : (
               transcripts.map((msg) => {
                 const isTrainee = msg.role === 'user';
                 return (
                   <div key={msg.id} className={`flex gap-3 ${isTrainee ? 'flex-row-reverse' : ''}`}>
                      <div className="shrink-0 flex flex-col items-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-wider ${
                          isTrainee 
                            ? 'bg-blue-950 text-blue-300 border border-blue-700/50' 
                            : 'bg-amber-950 text-amber-300 border border-amber-700/50'
                        }`}>
                          {isTrainee ? 'VENDEDOR' : 'PROSPECTO'}
                        </span>
                      </div>

                      <div className={`flex-1 ${isTrainee ? 'text-right' : 'text-left'}`}>
                         <div className={`inline-block max-w-[85%] rounded px-3.5 py-2.5 text-xs text-left leading-relaxed font-sans shadow-md ${
                           isTrainee 
                             ? 'bg-[#152238] border border-blue-500/40 text-slate-100 font-medium' 
                             : 'bg-[#121721] border border-[#232F42] text-slate-200'
                         }`}>
                           {msg.text}
                         </div>
                      </div>
                   </div>
                 );
               })
            )}
          </div>

          {/* Bottom Telemetry Status Strip */}
          <div className="px-4 py-2 border-t border-[#1A2332] bg-[#090D14] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ESTACIÓN DE GRABACIÓN AUTOMÁTICA ACTIVA
            </span>
            <span className="hidden sm:inline">
              JYC CALL INTELLIGENCE ENGINE
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default function LiveCall({ onEvaluationComplete }: { onEvaluationComplete?: (score: number, evaluation: any, contactName: string, companyName: string, opts?: { id?: string; hasAudio?: boolean; conversationId?: string; audioUrl?: string }) => void }) {
  return (
    <ConversationProvider>
      <ElevenLabsCallView onEvaluationComplete={onEvaluationComplete} />
    </ConversationProvider>
  );
}
