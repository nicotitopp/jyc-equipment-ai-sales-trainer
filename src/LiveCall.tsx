import React, { useState, useRef, useEffect } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { 
  PhoneCall, Phone, Mic, MicOff, Loader2, Bot, User, ShieldCheck
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

  // Automatically update defaults when industry or language is switched
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
  const [showTranscript, setShowTranscript] = useState(false);

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
        role: msg.role || msg.source, // Handle both role and deprecated source
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
      setEvaluation(null);
      setShowEvaluation(false);
      const callId = Date.now().toString() + Math.random().toString().substring(2, 6);
      setCurrentCallId(callId);
      audioChunksRef.current = [];

      const audioConstraints: any = {
        echoCancellation: true,
        noiseSuppression: noiseSuppressionEnabled,
        autoGainControl: true,
        channelCount: 1,
        googEchoCancellation: true,
        googAutoGainControl: true,
        googNoiseSuppression: noiseSuppressionEnabled,
        googHighpassFilter: true,
        googNoiseReduction: noiseSuppressionEnabled
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      try {
        const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';
        const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        recorder.start(250);
        mediaRecorderRef.current = recorder;
      } catch (recErr) {
        console.warn("Could not start local MediaRecorder:", recErr);
      }
      
      // Determine the first message greeting in the correct language
      const greeting = language === 'English'
        ? `Good morning, thank you for calling ${companyName}. How can I help you?`
        : `Buenos días, gracias por llamar a ${companyName}. ¿En qué le puedo ayudar?`;

      const dynamicVariables = {
        difficulty: difficulty,
        language: language,
        first_message: greeting,
        contact_name: contactName || "Carlos",
        company_name: companyName || "Canteras del Norte",
        industry: industry
      };

      const langCode = language === 'Spanish' ? 'es' : 'en';

      const overrides = {
        agent: {
          language: langCode,
          first_message: greeting
        }
      };

      // Try fetching a signed URL from the backend (uses ELEVENLABS_API_KEY)
      let sessionConfig: any = {
        agentId: "agent_2501kw2zhyq8ewg9ntqm1613vhek",
        dynamicVariables,
        overrides
      };

      try {
        const res = await fetch("/api/elevenlabs/signed-url");
        if (res.ok) {
          const data = await res.json();
          if (data.signedUrl) {
            sessionConfig = {
              signedUrl: data.signedUrl,
              dynamicVariables,
              overrides
            };
          }
        }
      } catch (err) {
        console.warn("Could not fetch signed URL, falling back to direct agentId:", err);
      }

      await conversation.startSession(sessionConfig);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      alert("Failed to start conversation. Please ensure microphone permissions are granted.");
    }
  };

  const handleEndCall = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (recErr) {
        console.warn("Could not stop MediaRecorder:", recErr);
      }
    }
    await conversation.endSession();
  };

  const handleResetCall = () => {
    setTranscripts([]);
    setEvaluation(null);
    setShowEvaluation(false);
    setWasConnected(false);
    setCurrentCallId(null);
    setCurrentConversationId(null);
    audioChunksRef.current = [];
  };

  const triggerEvaluation = async () => {
    if (transcripts.length === 0) return;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.requestData();
        mediaRecorderRef.current.stop();
      } catch (recErr) {
        console.warn("Could not stop MediaRecorder on evaluate:", recErr);
      }
    }

    await new Promise(r => setTimeout(r, 200));

    if (currentCallId && audioChunksRef.current.length > 0) {
      try {
        const mime = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const localBlob = new Blob(audioChunksRef.current, { type: mime });
        await saveAudio(currentCallId, localBlob);
      } catch (saveErr) {
        console.warn("Could not save local recording:", saveErr);
      }
    }

    if (currentCallId && currentConversationId) {
      fetch(`/api/elevenlabs/conversation-audio/${currentConversationId}`)
        .then(res => res.ok ? res.blob() : null)
        .then(blob => {
          if (blob && blob.size > 0 && currentCallId) {
            saveAudio(currentCallId, blob).catch(console.warn);
          }
        })
        .catch(err => console.warn("Could not fetch remote conversation audio:", err));
    }

    setEvaluating(true);
    setShowEvaluation(true);

    try {
      const transcriptText = transcripts
        .map(t => `${t.role === 'user' ? 'Trainee (Sales Rep)' : 'Prospect'}: ${t.text}`)
        .join('\n');

      const industryLabels: Record<string, string> = {
        concrete: 'Concrete & Precast Industry',
        sand_gravel: 'Sand & Gravel / Quarries Industry',
        lumber: 'Lumber Industry & Sawmills',
        metal: 'Metal / Steel Pipe Industry',
        ports: 'Ports & Terminals',
        plastic: 'Plastic Industry',
        medical: 'Medical / Pharmaceutical Industry'
      };
      const selectedIndustryLabel = industryLabels[industry] || 'Heavy Machinery';

      let response;
      let retries = 3;
      let lastErr: any;

      while (retries > 0) {
        try {
          response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [
                {
                  role: 'user',
                  content: `Please evaluate this sales/purchasing cold call transcript. The representative is a buyer from JYC Equipment contacting a prospect named "${contactName}" representing "${companyName}" (operating in the ${selectedIndustryLabel} sector) regarding used heavy machinery.
The representative's primary goal is to BUY used heavy equipment (such as forklifts, wheel loaders, reach stackers, empty container handlers, standard or electric forklifts, etc.) from the company.

The entire call was conducted in ${language} at difficulty level "${difficulty}". You must write all critique details (strengths, weaknesses, objectionsHandled feedback, recommendations) in the user's primary language: Spanish. Factor the difficulty level into your grading of their objection handling, gatekeeper bypass, and confidence.

Review the following transcript of the call:
${transcriptText}

Verify the following items and build the checklist of what details the trainee gathered/asked:
- gatekeeperBypass: Did they introduce themselves to the operator and successfully reach/bypass to the Key Person (KP) named "${contactName}"?
- kpOpening: Did they use the correct script opening with the KP (asked if it was a bad time, introduced JYC Equipment, and checked if they have any equipment for sale right now or coming up this year)?
- equipmentQualification: IF the prospect has equipment for sale: did they ask the qualification questions (Make, Model, Year, Condition/Repairs) for the machine mentioned by the prospect? (If no equipment was available, mark as true if they confirmed this).
- futureReference: IF the prospect does NOT have equipment for sale: did they ask the reference questions to gather company information (process for surplus, if they buy used, branches, loaders/forklifts used)? (If equipment was available, mark as true).
- priceAndAssets: Did they ask for a target price and request pictures of the machine, the data plate, and the hour meter?
- objectionHandling: Did they address and try to overcome the prospect's objections (e.g., they prefer auctions, want to trade-in, have bank leases, already sold, or want a price first)?
- nextStepsSecure: Did they successfully get the prospect's personal contact details (WhatsApp or email) and establish clear next steps for a follow-up or callback?

You must return ONLY a JSON object with this exact structure:
{
  "score": number, // 0 to 100
  "summary": "Brief summary of the call performance in Spanish.",
  "strengths": ["Strength 1 in Spanish", "Strength 2 in Spanish", ...],
  "weaknesses": ["Weakness 1 in Spanish", "Weakness 2 in Spanish", ...],
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
    { "objection": "Name of objection (e.g. Auction, Lease, Trade-in) in Spanish", "handledWell": boolean, "feedback": "Brief feedback in Spanish" }
  ],
  "recommendations": ["Recommendation 1 in Spanish", "Recommendation 2 in Spanish", ...]
}`
                }
              ],
              systemInstruction: "You are a strict machinery sales auditor. Analyze the transcript and output ONLY valid JSON matching the requested schema. Do not write any markdown code blocks, just raw JSON."
            })
          });

          if (response.ok) break;

          // If server status is waking up (502/503/504) retry
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
        throw lastErr || new Error("Failed to connect to server after retries.");
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch evaluation');
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
          throw new Error("Invalid JSON response from AI: " + text);
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
        contactName || "Carlos", 
        companyName || "Canteras del Norte",
        {
          id: currentCallId || undefined,
          hasAudio: true,
          conversationId: currentConversationId || undefined,
          audioUrl: currentConversationId ? `/api/elevenlabs/conversation-audio/${currentConversationId}` : undefined
        }
      );
    } catch (error: any) {
      console.error("Evaluation error:", error);
      setEvaluation({
        score: 0,
        summary: "Failed to generate AI evaluation due to an error.",
        strengths: ["Evaluation failed to run"],
        weaknesses: ["Error connecting to Gemini API: " + error.message],
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
        recommendations: ["Ensure your internet is working and try again."]
      });
    } finally {
      setEvaluating(false);
    }
  };

  if (showEvaluation) {
    if (evaluating) {
      return (
        <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 bg-slate-50 overflow-y-auto space-y-6 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-16 shadow-sm border border-slate-200 flex flex-col items-center justify-center space-y-6 w-full max-w-2xl">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
              <div className="absolute w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-center space-y-2 max-w-md">
              <h3 className="text-xl font-bold text-slate-800 animate-pulse">Auditing Call Transcript...</h3>
              <p className="text-slate-500 text-sm">
                Gemini is checking your call flow against JYC sales script guidelines and cold calling checklists.
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
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 bg-slate-50 overflow-hidden">
      <div className="max-w-5xl w-full flex flex-col md:flex-row h-full gap-5">
        
        {/* Call Controls */}
        <div className="md:w-[360px] bg-white rounded-xl shadow-xs border border-slate-200 p-5 text-center space-y-5 shrink-0 flex flex-col justify-start overflow-y-auto max-h-full text-left">
          <div className="space-y-1">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-2 border border-blue-100">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Simulación Telefónica por Voz</h2>
            <p className="text-slate-500 text-xs">
              Conversación bidireccional en tiempo real con el comprador prospecto mediante ElevenLabs ConvAI.
            </p>
          </div>

          {/* Configuration Form (only when not active) */}
          {!isConnected && !isConnecting && (
            <div className="text-left space-y-3 w-full bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Sim Config</h4>
              
              {/* Idioma */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Language / Idioma</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLanguage('English')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      language === 'English'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('Spanish')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      language === 'Spanish'
                        ? 'bg-amber-50 border-amber-300 text-amber-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Español
                  </button>
                </div>
              </div>

              {/* Dificultad */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Difficulty / Dificultad</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setDifficulty('friendly')}
                    className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                      difficulty === 'friendly'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🌱 Friendly
                  </button>
                  <button
                    onClick={() => setDifficulty('challenging')}
                    className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                      difficulty === 'challenging'
                        ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ⚡ Challenging
                  </button>
                  <button
                    onClick={() => setDifficulty('hardcore')}
                    className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                      difficulty === 'hardcore'
                        ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🔥 Hardcore
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  {difficulty === 'friendly' && '• Cooperative gatekeeper & receptive manager with 1 objection.'}
                  {difficulty === 'challenging' && '• Strict gatekeeper, busy manager pushing for price first.'}
                  {difficulty === 'hardcore' && '• Hostile gatekeeper, suspicious manager & heavy objections.'}
                </p>
              </div>

              {/* Target Industry */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Target Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-700"
                >
                  <option value="plastic">🧪 Plastics & Injection Molding</option>
                  <option value="concrete">🏗️ Concrete & Precast</option>
                  <option value="sand_gravel">⛰️ Sand & Gravel</option>
                  <option value="lumber">🪵 Lumber & Sawmills</option>
                  <option value="metal">⚙️ Steel & Metal Pipe</option>
                  <option value="ports">🚢 Ports & Container Terminals</option>
                  <option value="medical">🏥 Medical & Pharma Logistics</option>
                </select>
              </div>

              {/* Detalles adicionales */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Noise Cancellation Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-md ${noiseSuppressionEnabled ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block leading-tight">Noise Suppression</span>
                    <span className="text-[9px] text-slate-400 block leading-tight">Filters fan, keyboard & room noise</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNoiseSuppressionEnabled(!noiseSuppressionEnabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    noiseSuppressionEnabled ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      noiseSuppressionEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          <div className="min-h-[72px] flex items-center justify-center">
            {isConnecting && (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <p className="text-xs font-semibold animate-pulse">Estableciendo conexión por voz...</p>
              </div>
            )}
            {isConnected && (
              <div className="flex flex-col items-center gap-2 w-full">
                 <div className="flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                   <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                     {formatDuration(callDuration)}
                   </span>
                 </div>

                 {conversation.isSpeaking ? (
                   <div className="flex items-center gap-1.5 h-8">
                     <span className="w-1 bg-blue-600 rounded-full animate-waveform-1" />
                     <span className="w-1 bg-blue-600 rounded-full animate-waveform-2" />
                     <span className="w-1 bg-blue-600 rounded-full animate-waveform-3" />
                     <span className="w-1 bg-blue-600 rounded-full animate-waveform-4" />
                     <span className="w-1 bg-blue-600 rounded-full animate-waveform-5" />
                     <span className="text-xs text-blue-700 font-semibold ml-2">El prospecto está hablando...</span>
                   </div>
                 ) : (
                   <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                     <Mic className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                     <span>Tu turno de hablar al micrófono</span>
                   </div>
                 )}
                 <p className="text-[10px] text-slate-400 font-mono">
                   {companyName} • {contactName}
                 </p>
              </div>
            )}
            {!isConnected && !isConnecting && (
               <div className="flex flex-col items-center text-slate-400 text-xs">
                 <p className="font-medium">Listo para iniciar simulación</p>
                 <span className="text-[10px] text-slate-400">Verifica tu micrófono antes de llamar</span>
               </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-center gap-3 shrink-0">
            {!isConnected && !isConnecting && (
              <button
                onClick={handleStartCall}
                className="px-6 py-2.5 w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-lg font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <Phone className="w-4 h-4" />
                Iniciar Llamada de Simulación
              </button>
            )}

            {(isConnected || isConnecting) && (
              <button
                onClick={handleEndCall}
                className="px-6 py-2.5 w-full bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white rounded-lg font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <Phone className="w-4 h-4 fill-current rotate-[135deg]" />
                Finalizar Llamada y Auditar
              </button>
            )}
          </div>
        </div>

        {/* Transcript Area */}
        <div className="md:flex-1 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col min-h-0 text-left">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 shrink-0 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Transcripción en Tiempo Real</h3>
            <span className="text-[10px] font-mono text-slate-400">Audio Bidireccional</span>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {transcripts.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center space-y-2 p-6">
                 <div className="p-3 bg-slate-100 text-slate-400 rounded-lg">
                   <PhoneCall className="w-5 h-5" />
                 </div>
                 <p className="font-medium text-slate-600">Inicia la llamada para comenzar el diálogo con el prospecto.</p>
                 <span className="text-[11px] text-slate-400">Las líneas habladas aparecerán aquí transcritas en vivo.</span>
               </div>
            ) : (
               transcripts.map((msg) => (
                 <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <span className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase h-5 flex items-center ${
                      msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {msg.role === 'user' ? 'VENDEDOR' : 'PROSPECTO'}
                    </span>
                    <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                       <div className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-xs text-left leading-relaxed ${
                         msg.role === 'user' ? 'bg-blue-600 text-white font-medium' : 'bg-slate-100 text-slate-800'
                       }`}>
                         {msg.text}
                       </div>
                    </div>
                 </div>
               ))
            )}
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
