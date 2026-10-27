import React, { useState, useRef, useEffect } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { Mode, HistoryItem, User as UserType } from './types';
import { 
  PhoneCall, PhoneOff, Mic, MicOff, Loader2, ShieldCheck, 
  BookOpen, CheckCircle2, Sparkles, Building2, User, Target, 
  ChevronRight, History, UploadCloud, MessageSquare, X, Volume2, AlertCircle
} from 'lucide-react';
import Scorecard from './Scorecard';
import { saveAudio } from './audioDb';

interface TranscriptItem {
  id: number;
  role: 'user' | 'agent' | 'ai';
  text: string;
}

interface ScenarioConfig {
  id: string;
  title: string;
  machinery: string;
  context: string;
  objective: string;
  defaults: {
    English: { company: string; contact: string; roleTitle: string };
    Spanish: { company: string; contact: string; roleTitle: string };
  };
}

const SCENARIOS: ScenarioConfig[] = [
  {
    id: 'concrete',
    title: 'Concrete & Quarries',
    machinery: 'CAT Wheel Loaders (988, 966) and heavy forklifts',
    context: 'Aggregates and precast plant with periodic heavy fleet renewal.',
    objective: 'Bypass reception, reach plant manager, and qualify surplus loaders or heavy forklifts.',
    defaults: {
      English: { company: 'Northern Quarries', contact: 'Charles', roleTitle: 'Plant Manager' },
      Spanish: { company: 'Canteras del Norte', contact: 'Carlos', roleTitle: 'Jefe de Planta' }
    }
  },
  {
    id: 'plastic',
    title: 'Plastics & Injection Molding',
    machinery: '500–2,000T injection molders (Shot: 20/50/100 oz · Screw: 50/70/135 mm), extruders & chillers',
    context: 'Plastic molding plant upgrading large-tonnage injection lines (Engel, Krauss Maffei, Husky, Milacron, Arburg, JSW, Nissei, Sumitomo, UBE, Toshiba).',
    objective: 'Reach operations director, qualify tonnage, shot size (oz), screw diameter (mm) & asking price, and highlight turnkey rigging.',
    defaults: {
      English: { company: 'Matrix Plastics', contact: 'Sophie', roleTitle: 'Operations Director' },
      Spanish: { company: 'Plásticos y Polímeros', contact: 'Sofía', roleTitle: 'Directora de Operaciones' }
    }
  },
  {
    id: 'ports',
    title: 'Ports & Terminals',
    machinery: '45T Reach Stackers, container handlers, and yard spotters',
    context: 'Maritime and intermodal terminal rotating container handling equipment.',
    objective: 'Reach fleet maintenance and qualify surplus Reach Stackers (Kalmar, Konecranes, Taylor, Hyster).',
    defaults: {
      English: { company: 'Pacific Port Terminals', contact: 'Frank', roleTitle: 'Fleet Manager' },
      Spanish: { company: 'Terminal Portuaria del Pacífico', contact: 'Francisco', roleTitle: 'Jefe de Flota' }
    }
  },
  {
    id: 'metal',
    title: 'Steel & Metal Processing',
    machinery: '30,000 to 90,000 lbs heavy forklifts and coil handlers',
    context: 'Steel tubing and metal processing facility operating heavy lifting machinery.',
    objective: 'Reach equipment or plant manager to detect surplus heavy-duty forklifts.',
    defaults: {
      English: { company: 'Apex Steel Tubing', contact: 'Edward', roleTitle: 'Maintenance Manager' },
      Spanish: { company: 'Aceros Industriales', contact: 'Eduardo', roleTitle: 'Jefe de Mantenimiento' }
    }
  },
  {
    id: 'sand_gravel',
    title: 'Sand & Gravel Aggregates',
    machinery: 'Wheel loaders, excavators, and articulated dump trucks',
    context: 'Sand and aggregate extraction site running high-hour machinery.',
    objective: 'Identify offline units or machines up for renewal; arrange data plate and equipment photos.',
    defaults: {
      English: { company: 'Pioneer Sand & Gravel', contact: 'Tyler', roleTitle: 'Site Operations Lead' },
      Spanish: { company: 'Áridos y Gravas del Norte', contact: 'Mateo', roleTitle: 'Encargado de Operaciones' }
    }
  },
  {
    id: 'lumber',
    title: 'Lumber & Sawmills',
    machinery: 'Forestry loaders and heavy yard forklifts',
    context: 'Lumber mill with active logistics yard and sawing lines.',
    objective: 'Qualify machinery available today or profile account using the 6 future reference questions.',
    defaults: {
      English: { company: 'Timberlands Sawmill', contact: 'Robert', roleTitle: 'Yard Superintendent' },
      Spanish: { company: 'Maderas del Bosque', contact: 'Roberto', roleTitle: 'Superintendente de Planta' }
    }
  },
  {
    id: 'medical',
    title: 'Medical Imaging (JYC Medical)',
    machinery: 'MRI Scanners (1.5T & 3.0T), CT and PET/CT scanners',
    context: 'Hospital network or diagnostic imaging center scheduling scanner replacement.',
    objective: 'Reach imaging director, offer complete cryogenic ramp-down & de-installation, and qualify system.',
    defaults: {
      English: { company: 'BioPharma Diagnostics', contact: 'Sarah', roleTitle: 'Imaging Director' },
      Spanish: { company: 'Centro Diagnóstico Nacional', contact: 'Elena', roleTitle: 'Directora de Imagenología' }
    }
  }
];

interface LiveCallProps {
  currentUser?: UserType | null;
  recentHistory?: HistoryItem[];
  onNavigate?: (mode: Mode) => void;
  onEvaluationComplete?: (
    score: number, 
    evaluation: any, 
    contactName: string, 
    companyName: string, 
    opts?: { id?: string; hasAudio?: boolean; conversationId?: string; audioUrl?: string }
  ) => void;
}

const ElevenLabsCallView = ({ 
  currentUser,
  recentHistory = [],
  onNavigate,
  onEvaluationComplete 
}: LiveCallProps) => {
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Audio Recording States
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Configuration States
  const [difficulty, setDifficulty] = useState<'friendly' | 'challenging' | 'hardcore'>('friendly');
  const [language, setLanguage] = useState<'English' | 'Spanish'>('English');
  const [industry, setIndustry] = useState<string>('concrete');
  const [contactName, setContactName] = useState('Charles');
  const [companyName, setCompanyName] = useState('Northern Quarries');
  const [noiseSuppressionEnabled, setNoiseSuppressionEnabled] = useState(true);

  // Script helper drawer state
  const [showScriptHelper, setShowScriptHelper] = useState(false);
  const [scriptHelperTab, setScriptHelperTab] = useState<'opening' | 'qualify' | 'objections'>('opening');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const activeScenario = SCENARIOS.find(s => s.id === industry) || SCENARIOS[0];

  useEffect(() => {
    const defaults = activeScenario.defaults[language];
    setCompanyName(defaults.company);
    setContactName(defaults.contact);
  }, [industry, language]);

  // Evaluation & Disconnection States
  const [wasConnected, setWasConnected] = useState(false);
  const [unexpectedDisconnect, setUnexpectedDisconnect] = useState(false);
  const userEndedCallRef = useRef(false);
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
      setConnectionError(null);
      setUnexpectedDisconnect(false);
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
    },
    onError: (err: any) => {
      console.error("ElevenLabs conversation error:", err);
      setConnectionError(typeof err === 'string' ? err : (err?.message || "Voice connection was interrupted. Please check your microphone and try again."));
    }
  });

  const isConnected = conversation.status === "connected";
  const isConnecting = conversation.status === "connecting";

  // Call timer & WebSocket keep-alive effect (prevents 60s inactivity disconnect code 1002 when muted or thinking)
  useEffect(() => {
    let interval: any;
    let keepAliveInterval: any;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      keepAliveInterval = setInterval(() => {
        try {
          (conversation as any).sendUserActivity?.();
        } catch {}
      }, 20000);
    } else if (!unexpectedDisconnect) {
      setCallDuration(0);
    }
    return () => {
      clearInterval(interval);
      clearInterval(keepAliveInterval);
    };
  }, [isConnected, unexpectedDisconnect]);

  // Watch for session ending: distinguish between voluntary End Call and unexpected drop
  useEffect(() => {
    if (isConnected) {
      setWasConnected(true);
      setUnexpectedDisconnect(false);
      setEvaluation(null);
      setShowEvaluation(false);
    } else if (wasConnected && !isConnected && conversation.status === "disconnected") {
      setWasConnected(false);
      if (userEndedCallRef.current) {
        userEndedCallRef.current = false;
        if (transcripts.length > 0) {
          triggerEvaluation();
        }
      } else if (transcripts.length > 0) {
        setUnexpectedDisconnect(true);
      }
    }
  }, [isConnected, conversation.status, wasConnected, transcripts.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  const handleToggleMute = () => {
    const nextMuted = !conversation.isMuted;
    conversation.setMuted(nextMuted);
    try {
      (conversation as any).sendUserActivity?.();
    } catch {}
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !nextMuted;
      });
    }
  };

  const handleStartCall = async () => {
    try {
      userEndedCallRef.current = false;
      setUnexpectedDisconnect(false);
      setConnectionError(null);
      setTranscripts([]);
      const callId = Date.now().toString() + Math.random().toString().substring(2, 6);
      setCurrentCallId(callId);
      setCurrentConversationId(null);
      audioChunksRef.current = [];

      // Note: Do not open a duplicate parallel getUserMedia + MediaRecorder stream here,
      // as competing microphone streams on Windows USB/Bluetooth headsets can freeze
      // audio packets to ElevenLabs and trigger a 60s inactivity disconnect.
      // Full two-way call audio is automatically retrieved from ElevenLabs upon call completion.

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

      const branchId = "agtbrch_4801kw2zj0c7fej8qh66cv2x5are";
      let sessionConfig: any = {
        agentId: "agent_2501kw2zhyq8ewg9ntqm1613vhek",
        branchId,
        dynamicVariables,
        overrides
      };

      try {
        const res = await fetch(`/api/elevenlabs/signed-url?branchId=${encodeURIComponent(branchId)}`);
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
    } catch (err: any) {
      console.error("Start call error:", err);
      setConnectionError(err.message || 'Please check your internet connection and microphone permissions.');
    }
  };

  const handleEndCall = async () => {
    try {
      userEndedCallRef.current = true;
      setUnexpectedDisconnect(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      await conversation.endSession();
    } catch (err) {
      console.error("End call error:", err);
      if (transcripts.length > 0) {
        triggerEvaluation();
      }
    }
  };

  const handleResetCall = () => {
    userEndedCallRef.current = false;
    setUnexpectedDisconnect(false);
    setShowEvaluation(false);
    setEvaluation(null);
    setTranscripts([]);
    setCurrentCallId(null);
    setCurrentConversationId(null);
  };

  const triggerEvaluation = async () => {
    setShowEvaluation(true);
    setEvaluating(true);

    // Flush and stop recording if still running
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.requestData();
      } catch (e) {}
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Wait briefly for final audio chunks to flush
    await new Promise(resolve => setTimeout(resolve, 600));

    let hasSavedAudio = false;
    if (currentCallId) {
      if (audioChunksRef.current.length > 0) {
        try {
          const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
          const localBlob = new Blob(audioChunksRef.current, { type: mimeType });
          await saveAudio(currentCallId, localBlob);
          hasSavedAudio = true;

          // Also sync with server storage so /api/audios/:id works permanently for PDF link
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64data = (reader.result as string)?.split(',')[1];
            if (base64data) {
              fetch('/api/audios/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: currentCallId,
                  audioBase64: base64data,
                  mimeType: localBlob.type || 'audio/webm'
                })
              }).catch(() => {});
            }
          };
          reader.readAsDataURL(localBlob);
        } catch (err) {
          console.error("Failed to save local audio:", err);
        }
      }

      if (currentConversationId) {
        hasSavedAudio = true;
        (async () => {
          for (let attempt = 0; attempt < 5; attempt++) {
            await new Promise(r => setTimeout(r, 3000));
            try {
              const res = await fetch(`/api/elevenlabs/conversation-audio/${currentConversationId}`);
              if (res.ok) {
                const fullBlob = await res.blob();
                if (fullBlob.size > 1000) {
                  await saveAudio(currentCallId, fullBlob);
                  break;
                }
              }
            } catch (e) {
              console.warn("Attempt to fetch full ElevenLabs audio failed:", e);
            }
          }
        })();
      }
    }

    try {
      const dialogueText = transcripts.map(t => `${t.role === 'user' ? 'Trainee' : 'Prospect'}: ${t.text}`).join('\n');

      const prompt = `You are an expert commercial performance auditor specializing in industrial heavy machinery acquisitions and sales for JYC Equipment / JYC Medical.
Audit the following live sales call between our salesperson (Trainee) and an industrial decision-maker (Prospect).

Language spoken in call: ${language}
Target Company: ${companyName}
Target Contact (Key Person): ${contactName}
Difficulty setting: ${difficulty}

Dialogue Transcript:
${dialogueText}

CRITICAL RULES FOR AUDITING & SCORING:
1. EVIDENCE-BASED EVALUATION (MANDATORY):
   - Every score, strength, weakness, and objection critique MUST be backed by concrete, observable examples from the conversation transcript.
   - Do NOT award a high score simply because the prospect ended up showing interest or agreeing to a next step; evaluate the actual quality, structure, and commercial rigor demonstrated by the salesperson.
2. BUYING VS. SELLING OPPORTUNITY DETECTION:
   - Evaluate whether the salesperson properly detected and managed an opportunity to BUY surplus equipment from the prospect, an opportunity to SELL/OFFER JYC machinery to the prospect, or both (cross-selling / pivoting).
3. BALLPARK / PRICING RULE WHEN ACQUIRING EQUIPMENT:
   - When the trainee is buying surplus equipment from the prospect, they should NEVER guess or quote a premature blind cash "ballpark" over the phone without inspecting the data plate, serial numbers, hours, and machine condition. Deflecting firmly and explaining JYC's 24-hour formal appraisal process upon receiving data plate/hour meter photos earns full marks.
   - When the trainee is offering/selling a JYC machine to the prospect, evaluate how clearly they presented the machine's specs, condition, hours, warranty, availability, and price justification.
4. 10 OBSERVABLE COMMERCIAL EVALUATION CRITERIA (CHECKLIST):
   Evaluate each of the following 10 criteria as true/false based on observable behavior in the call:
   - "openingAndPresentation": 1. Professional opening, clear identification, and effective gatekeeper navigation.
   - "attentionGrabbing": 2. Ability to earn and hold the decision-maker's attention with a relevant commercial hook.
   - "needsIdentification": 3. Identification of the prospect's operational situation, fleet needs, or surplus disposition plans.
   - "activeListeningAndQuestions": 4. Active listening, continuity across turns, and asking relevant qualification/discovery questions without repeating already-given info.
   - "proposalClarity": 5. Clarity of the machinery proposal (whether explaining JYC's acquisition process or presenting a specific machine offer with clear specs/terms).
   - "commercialValueArgumentation": 6. Argumentation of commercial value (e.g., higher net cash than dealer trade-in, 24h payment, 100% turnkey rigging/freight, 0% commission, or 30-day warranty/financing on sales).
   - "objectionHandling": 7. Effective, evidence-backed handling of contextual objections (price, need, condition, trust, timing, current supplier/dealer, or logistics).
   - "negotiationWithoutPressure": 8. Ability to negotiate and advance the conversation professionally without exerting excessive or artificial pressure.
   - "unexpectedOpportunities": 9. Detection and leveraging of unexpected commercial opportunities (identifying surplus units, future renewal cycles, or pivoting between buying and selling when appropriate).
   - "closingAndNextStep": 10. Clear closing and definition of a concrete next step (securing direct email/WhatsApp, scheduling inspection/photos, or sending a formal quote).

Please write all output critique fields (summary, strengths, weaknesses, objections feedback, recommendations) in English, citing brief examples from the conversation.

Output strictly valid JSON with this exact schema:
{
  "score": number, // 0 to 100
  "contactName": "${contactName}",
  "companyName": "${companyName}",
  "summary": "Executive summary in English (include whether buying/selling opportunities were properly detected and cite concrete examples)...",
  "strengths": ["Strength 1 backed by call example", "Strength 2 backed by call example"],
  "weaknesses": ["Improvement area 1 backed by call example", "Improvement area 2 backed by call example"],
  "checklist": {
    "openingAndPresentation": boolean,
    "attentionGrabbing": boolean,
    "needsIdentification": boolean,
    "activeListeningAndQuestions": boolean,
    "proposalClarity": boolean,
    "commercialValueArgumentation": boolean,
    "objectionHandling": boolean,
    "negotiationWithoutPressure": boolean,
    "unexpectedOpportunities": boolean,
    "closingAndNextStep": boolean
  },
  "objectionsHandled": [
    { "objection": "Objection raised", "handledWell": boolean, "feedback": "Constructive feedback with example from the call" }
  ],
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"]
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

      if (!response) throw lastErr || new Error("Failed to communicate with evaluation service.");
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
          throw new Error("Invalid evaluator response format");
        }
      }

      const normalizedTranscript = transcripts.map(t => ({
        role: t.role === 'user' ? 'user' : 'prospect',
        text: t.text
      }));

      const fullEvaluation = {
        ...parsedData,
        difficulty: difficulty,
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
          hasAudio: hasSavedAudio,
          conversationId: currentConversationId || undefined,
          audioUrl: currentConversationId ? `/api/elevenlabs/conversation-audio/${currentConversationId}` : undefined,
          difficulty: difficulty
        }
      );
    } catch (err: any) {
      console.error("Evaluation error:", err);
      setEvaluation({
        score: 0,
        summary: "Could not generate automatic evaluation: " + err.message,
        strengths: [],
        weaknesses: [err.message],
        checklist: {
          openingAndPresentation: false,
          attentionGrabbing: false,
          needsIdentification: false,
          activeListeningAndQuestions: false,
          proposalClarity: false,
          commercialValueArgumentation: false,
          objectionHandling: false,
          negotiationWithoutPressure: false,
          unexpectedOpportunities: false,
          closingAndNextStep: false
        },
        objectionsHandled: [],
        recommendations: ["Check your connection and try repeating the call."]
      });
    } finally {
      setEvaluating(false);
    }
  };

  // POST-CALL EVALUATION VIEW
  if (showEvaluation) {
    if (evaluating) {
      return (
        <div className="flex-1 w-full p-6 flex items-center justify-center bg-[#F4F6F9]">
          <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4 max-w-md text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-display font-bold text-slate-900">
                Analyzing your conversation
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Reviewing gatekeeper bypass, opening with {contactName}, qualification questions, and objection handling.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return evaluation && (
      <div className="flex-1 overflow-y-auto bg-[#F4F6F9]">
        <Scorecard 
          evaluation={evaluation} 
          onReset={handleResetCall} 
          customTranscripts={transcripts} 
          audioId={currentCallId || undefined}
          conversationId={currentConversationId || undefined}
          scenarioTitle={`${activeScenario.title} — ${companyName}`}
          difficulty={difficulty}
        />
      </div>
    );
  }

  // ACTIVE / CONNECTING CALL STUDIO VIEW
  if (isConnected || isConnecting || unexpectedDisconnect) {
    return (
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden bg-[#F4F6F9]">
        
        {/* Main Call Stage & Live Transcript */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden p-4 sm:p-6 gap-4 max-w-5xl mx-auto w-full">
          
          {/* Focused Voice Stage Card */}
          <div className="bg-[#0F172A] text-white rounded-2xl p-5 sm:p-7 shadow-lg border border-slate-800 shrink-0">
            
            {/* Top Row: Client Context & Timer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 font-display font-bold text-lg">
                  {contactName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-display font-bold text-white">
                      {contactName} · {companyName}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                      {activeScenario.title}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                    <span className="text-slate-400">Objective:</span> {activeScenario.objective}
                  </p>
                </div>
              </div>

              {/* Connection status & timer */}
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700">
                  <span className={`w-2 h-2 rounded-full ${
                    unexpectedDisconnect
                      ? 'bg-red-400'
                      : isConnecting
                        ? 'bg-amber-400 animate-ping'
                        : 'bg-emerald-400 animate-pulse'
                  }`} />
                  <span className="text-xs font-medium text-slate-200">
                    {unexpectedDisconnect ? 'Line interrupted' : isConnecting ? 'Connecting...' : 'In call'}
                  </span>
                  {(isConnected || unexpectedDisconnect) && (
                    <span className="text-xs font-mono font-semibold text-white pl-1 border-l border-slate-700">
                      {formatDuration(callDuration)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Center Voice Presence Indicator */}
            <div className="py-7 flex flex-col items-center justify-center text-center">
              {unexpectedDisconnect ? (
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-base font-display font-semibold text-white">
                      The voice connection was interrupted
                    </p>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Your conversation transcript ({transcripts.length} turns) has been preserved. You can evaluate the call up to this point or start a new session.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUnexpectedDisconnect(false);
                        triggerEvaluation();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Evaluate conversation so far</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetCall}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Start new call</span>
                    </button>
                  </div>
                </div>
              ) : isConnecting ? (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  </div>
                  <div>
                    <p className="text-base font-display font-semibold text-white">
                      Calling {companyName}...
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Get ready to greet reception when they answer
                    </p>
                  </div>
                </div>
              ) : conversation.isSpeaking ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center gap-1 mx-auto">
                    <span className="w-1 h-6 bg-amber-400 rounded-full animate-waveform-1" />
                    <span className="w-1 h-6 bg-amber-400 rounded-full animate-waveform-2" />
                    <span className="w-1 h-6 bg-amber-400 rounded-full animate-waveform-3" />
                    <span className="w-1 h-6 bg-amber-400 rounded-full animate-waveform-4" />
                    <span className="w-1 h-6 bg-amber-400 rounded-full animate-waveform-5" />
                  </div>
                  <div>
                    <p className="text-base font-display font-semibold text-amber-300">
                      {contactName} is speaking
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Listen closely to respond or qualify the equipment
                    </p>
                  </div>
                </div>
              ) : conversation.isMuted ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
                    <MicOff className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-base font-display font-semibold text-red-300">
                      Your microphone is muted
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Unmute below to continue speaking
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 relative">
                    <span className="absolute inset-0 rounded-full bg-emerald-400/10 animate-ping" />
                    <Mic className="w-7 h-7 relative z-10" />
                  </div>
                  <div>
                    <p className="text-base font-display font-semibold text-emerald-300">
                      Your turn to speak — Prospect is listening
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Speak naturally into your microphone ({language === 'English' ? 'in English' : 'in Spanish'})
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Call Controls Bar */}
            {!unexpectedDisconnect && (
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    disabled={!isConnected}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 ${
                      conversation.isMuted
                        ? 'bg-red-500/20 text-red-200 border border-red-500/40 hover:bg-red-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {conversation.isMuted ? (
                      <>
                        <MicOff className="w-4 h-4 text-red-400" />
                        <span>Unmute microphone</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 text-emerald-400" />
                        <span>Mute microphone</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowScriptHelper(!showScriptHelper)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border ${
                      showScriptHelper
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{showScriptHelper ? 'Hide script helper' : 'View script helper'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleEndCall}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End & evaluate call</span>
                </button>
              </div>
            )}
          </div>

          {/* Live Conversation Transcript */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col min-h-0 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs font-semibold text-slate-700">
                Live transcript
              </span>
              <span className="text-xs text-slate-400">
                {transcripts.length} {transcripts.length === 1 ? 'turn' : 'turns'}
              </span>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3">
              {transcripts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-8 text-slate-400 text-xs">
                  <p>The transcript will appear here as you speak with {contactName}.</p>
                </div>
              ) : (
                transcripts.map((msg) => {
                  const isTrainee = msg.role === 'user';
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isTrainee ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                        isTrainee
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        <div className={`text-[11px] font-semibold mb-0.5 ${
                          isTrainee ? 'text-blue-100' : 'text-slate-500'
                        }`}>
                          {isTrainee ? 'You (Sales Rep)' : contactName}
                        </div>
                        <div>{msg.text}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Optional Collapsible Script Helper Drawer */}
        {showScriptHelper && (
          <div className="w-full lg:w-[400px] xl:w-[440px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-80 lg:h-full shrink-0 shadow-lg">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-display font-bold text-slate-900">Quick Reference Guide</h3>
              </div>
              <button
                onClick={() => setShowScriptHelper(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex border-b border-slate-200 px-3 pt-2 gap-1 bg-slate-50">
              {[
                { id: 'opening', label: '1. Opening' },
                { id: 'qualify', label: '2. Qualify (7)' },
                { id: 'objections', label: '3. Objections' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setScriptHelperTab(tab.id as any)}
                  className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors cursor-pointer ${
                    scriptHelperTab === tab.id
                      ? 'border-amber-500 text-slate-900 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed text-slate-700">
              {scriptHelperTab === 'opening' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="font-semibold text-slate-900">Step 1: Bypass Reception (Gatekeeper)</div>
                    <p className="italic text-slate-800">
                      {language === 'English'
                        ? `"Good morning, could you please transfer me to the person in charge of plant operations or the used machinery?"`
                        : `"Buenos días, ¿me podría comunicar con el encargado de planta, operaciones o la maquinaria usada?"`}
                    </p>
                    <p className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200/70">
                      Always ask for the <strong>Plant or Operations Manager</strong> so reception avoids transferring you to sales.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="font-semibold text-slate-900">Step 2: Opening with {contactName}</div>
                    <p className="italic text-slate-800">
                      {language === 'English'
                        ? `"Hi ${contactName}, this is ${currentUser?.name || 'Alex'} with JYC Equipment. Did I catch you at a bad time? ... We are nationwide buyers of used industrial machinery. Do you have any surplus units for sale right now or coming up this year?"`
                        : `"Hola ${contactName}, habla ${currentUser?.name || 'Alex'} de JYC Equipment. ¿Lo tomo en un mal momento? ... Somos compradores nacionales de maquinaria pesada usada. ¿Tienen algún equipo disponible para la venta ahora o por renovar este año?"`}
                    </p>
                  </div>
                </div>
              )}

              {scriptHelperTab === 'qualify' && (
                <div className="space-y-2.5">
                  <p className="text-slate-600">Ask these 7 questions in order when they confirm having machinery:</p>
                  <ol className="space-y-2">
                    {[
                      '1. Equipment type (injection molder, loader, forklift, reach stacker).',
                      '2. Exact model.',
                      '3. Make / manufacturer (Engel, Krauss Maffei, Husky, Milacron, Arburg, JSW, Nissei, Sumitomo, UBE, Toshiba, CAT, Kalmar...).',
                      '4. Capacity or tonnage (e.g. 500–2000T; for injection molders also Shot Size: 20/50/100 oz & Screw Diameter: 50/70/135 mm).',
                      '5. Year of manufacture and approximate hours.',
                      '6. Current condition (is it running or does it require repairs?).',
                      '7. Asking price in mind & photo request (data plate and hour meter) for 24h offer.'
                    ].map((q, i) => (
                      <li key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800">
                        {q}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {scriptHelperTab === 'objections' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-semibold text-slate-900">"Give me a price / What's your ballpark?"</div>
                    <p className="text-slate-600">
                      Never guess or give a blind number over the phone. Explain that JYC's valuation team requires photos of the data plate and hour meter to issue a formal written cash offer in 24 hours.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-semibold text-slate-900">"We send everything to auction"</div>
                    <p className="text-slate-600">
                      Remind them auctions charge 10% to 15% in seller commissions and freight. JYC pays within 24 hours, zero commissions, and handles all rigging/removal and transport.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-semibold text-slate-900">"We don't have anything for sale today"</div>
                    <p className="text-slate-600">
                      Ask future reference questions: how do they handle surplus machines, do they buy used equipment, and when (3, 6, or 12 months) would be best to check back.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // INITIAL LANDING / PRE-CALL PREPARATION VIEW
  const lastPractice = recentHistory.length > 0 ? recentHistory[0] : null;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F4F6F9]">
      <div className="max-w-6xl mx-auto space-y-6 text-left">
        
        {/* Welcome & Quick Summary Banner */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
              Hello{currentUser?.name ? `, ${currentUser.name.split(' ')[0]}` : ''}. What call would you like to practice today?
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl">
              Select an industrial scenario, review customer objectives, and launch a voice call to practice your opening, equipment qualification, and objection handling.
            </p>
          </div>

          {/* Secondary Quick Access Links */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onNavigate && (
              <>
                <button
                  onClick={() => onNavigate('Coach')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                  <span>Coach & Scripts</span>
                </button>
                <button
                  onClick={() => onNavigate('Real Call Audit')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
                  <span>Audit Recording</span>
                </button>
                <button
                  onClick={() => onNavigate('History')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-slate-600" />
                  <span>
                    {lastPractice ? `History (Last: ${lastPractice.score}/100)` : 'Session History'}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {connectionError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{connectionError}</span>
            </div>
            <button onClick={() => setConnectionError(null)} className="text-red-500 hover:text-red-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main 2-Column Practice Layout: Scenario Explorer (Left) + Call Setup & Launch Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left 7 Columns: Scenario Selection */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-display font-bold text-slate-800">
                1. Select Target Industrial Scenario
              </h3>
              <span className="text-xs text-slate-500">
                {SCENARIOS.length} sectors available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SCENARIOS.map((scen) => {
                const isSelected = scen.id === industry;
                const contactInfo = scen.defaults[language];

                return (
                  <button
                    key={scen.id}
                    type="button"
                    onClick={() => setIndustry(scen.id)}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-bold text-sm text-slate-900">
                          {scen.title}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-blue-700 leading-snug">
                        {scen.machinery}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {scen.context}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Customer: <strong className="text-slate-700">{contactInfo.contact}</strong> ({contactInfo.company})</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 5 Columns: Selected Scenario Brief & Primary Call Trigger */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              
              {/* Top Dark Header with Scenario Goal */}
              <div className="bg-[#0F172A] text-white p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-400">
                    2. Prepare & Launch Call
                  </span>
                  <span className="text-xs text-slate-400">
                    {activeScenario.title}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-display font-bold text-white">
                    {companyName}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Target Contact: <strong>{contactName}</strong> ({activeScenario.defaults[language].roleTitle})
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 leading-relaxed">
                  <span className="font-semibold text-amber-300 block mb-0.5">Practice Objective:</span>
                  {activeScenario.objective}
                </div>
              </div>

              {/* Call Settings Form */}
              <div className="p-5 sm:p-6 space-y-4">
                
                {/* Language & Difficulty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Call Language
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setLanguage('English')}
                        className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          language === 'English'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage('Spanish')}
                        className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          language === 'Spanish'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Spanish
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Prospect Demeanor
                    </label>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                      {[
                        { id: 'friendly', label: 'Receptive' },
                        { id: 'challenging', label: 'Busy' },
                        { id: 'hardcore', label: 'Tough' }
                      ].map((lvl) => (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setDifficulty(lvl.id as any)}
                          className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            difficulty === lvl.id
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Editable Client & Company Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Customer Company
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Target Contact Name
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Noise Cancellation Toggle */}
                <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className={`w-4 h-4 ${noiseSuppressionEnabled ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">Background Noise Suppression</span>
                      <span className="text-[11px] text-slate-500 block">Filters office and background noises on your microphone</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNoiseSuppressionEnabled(!noiseSuppressionEnabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      noiseSuppressionEnabled ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                        noiseSuppressionEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Primary CTA: Start Practice Call */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleStartCall}
                    className="w-full py-3.5 px-5 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 font-display font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 fill-current" />
                    <span>Start Practice Call</span>
                  </button>

                  <p className="text-[11px] text-center text-slate-500">
                    Upon ending the conversation, you will receive a detailed performance evaluation with recommendations.
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default function LiveCall(props: LiveCallProps) {
  return (
    <ConversationProvider>
      <ElevenLabsCallView {...props} />
    </ConversationProvider>
  );
}
