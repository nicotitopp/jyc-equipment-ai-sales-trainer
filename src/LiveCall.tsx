import React, { useState, useRef, useEffect } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { 
  PhoneCall, Phone, Mic, MicOff, Loader2, Bot, User,
  Award, CheckCircle2, XCircle, RotateCcw, FileText,
  Check, X, AlertCircle, ChevronDown, ChevronUp, AlertTriangle, ThumbsUp, ThumbsDown
} from 'lucide-react';

interface TranscriptItem {
  id: number;
  role: 'user' | 'agent' | 'ai';
  text: string;
}

const ElevenLabsCallView = () => {
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Configuration States
  const [difficulty, setDifficulty] = useState<'friendly' | 'tough'>('friendly');
  const [language, setLanguage] = useState<'English' | 'Spanish'>('English');
  const [callObjective, setCallObjective] = useState<'sell' | 'buy'>('sell');
  const [machineModel, setMachineModel] = useState('Kleemann MOBIREX MR 130');
  const [customMachine, setCustomMachine] = useState('');
  const [isCustomMachine, setIsCustomMachine] = useState(false);
  const [contactName, setContactName] = useState('Carlos');
  const [companyName, setCompanyName] = useState('Canteras del Norte');

  // Evaluation States
  const [wasConnected, setWasConnected] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const conversation = useConversation({
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
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const finalMachine = isCustomMachine ? customMachine : machineModel;
      
      // Determine the first message greeting in the correct language
      const greeting = language === 'English'
        ? `Good morning, ${companyName}, this is ${contactName}. How can I help you?`
        : `Buenos días, ${companyName}, habla ${contactName}. ¿En qué le puedo ayudar?`;

      await conversation.startSession({
        agentId: "agent_2501kw2zhyq8ewg9ntqm1613vhek",
        dynamicVariables: {
          difficulty: difficulty,
          language: language,
          first_message: greeting,
          machine_model: finalMachine || "Kleemann MOBIREX MR 130",
          contact_name: contactName || "Carlos",
          company_name: companyName || "Canteras del Norte",
          call_objective: callObjective
        }
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      alert("Failed to start conversation. Please ensure microphone permissions are granted.");
    }
  };

  const handleEndCall = async () => {
    await conversation.endSession();
  };

  const handleResetCall = () => {
    setTranscripts([]);
    setEvaluation(null);
    setShowEvaluation(false);
    setWasConnected(false);
  };

  const triggerEvaluation = async () => {
    if (transcripts.length === 0) return;

    setEvaluating(true);
    setShowEvaluation(true);

    try {
      const finalMachine = isCustomMachine ? customMachine : machineModel;
      
      const roleText = callObjective === 'sell'
        ? `SELL a construction machine: "${finalMachine}" to a prospect named "${contactName}" representing "${companyName}"`
        : `BUY a construction machine: "${finalMachine}" from a prospect named "${contactName}" representing "${companyName}" (who owns/sells the machine)`;

      const partnerRoleLabel = callObjective === 'sell' ? 'Prospect (Buyer)' : 'Prospect (Seller)';
      const transcriptText = transcripts
        .map(t => `${t.role === 'user' ? 'Trainee (Sales Rep)' : partnerRoleLabel}: ${t.text}`)
        .join('\n');

      const checklistInstructions = callObjective === 'sell'
        ? `- introductionBypass: Did they introduce themselves and bypass the operator/gatekeeper successfully if needed?
- needsQualification: Did they qualify the buyer's actual needs (e.g. projects, crushing volume, stone materials)?
- machineSpecs: Did they explain the specs and condition of the machine ("${finalMachine}")?
- priceLogistics: Did they discuss price and delivery/freight logistics?
- objectionHandling: Did they address and try to overcome the prospect's objections (e.g. already equipped, used machinery risk, parts availability, brush-offs)?
- followUpSecure: Did they successfully get the prospect's personal contact details (WhatsApp or email) to send details/photos/quote?
- nextSteps: Did they establish clear next steps for a follow-up or callback?`
        : `- introductionBypass: Did they introduce themselves and establish contact with the decision-maker or equipment owner?
- needsQualification: Did they qualify the machine's condition, hours/mileage, maintenance history, and reason for selling?
- machineSpecs: Did they ask for specific machine details, configuration, options, and verify the serial/data plate?
- priceLogistics: Did they discuss the seller's asking price, price flexibility, and logistics for inspection/pickup?
- objectionHandling: Did they handle the seller's objections (e.g. not ready to sell, wants too much money, prefers auction, too busy)?
- followUpSecure: Did they successfully get the prospect's personal contact details (WhatsApp or email) to receive pictures, maintenance records, or send a purchase offer?
- nextSteps: Did they establish clear next steps for scheduling an inspection, sending a formal offer, or a follow-up call?`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Please evaluate this sales call transcript. The representative is trying to ${roleText}.
The entire call was conducted in ${language}. You must write all critique details (strengths, weaknesses, objectionsHandled feedback, recommendations) in the user's primary language: Spanish.

Review the following transcript of the call:
${transcriptText}

Verify the following items and build the checklist of what details the trainee gathered/asked:
${checklistInstructions}

You must return ONLY a JSON object with this exact structure:
{
  "score": number, // 0 to 100
  "summary": "Brief summary of the call performance in Spanish.",
  "strengths": ["Strength 1 in Spanish", "Strength 2 in Spanish", ...],
  "weaknesses": ["Weakness 1 in Spanish", "Weakness 2 in Spanish", ...],
  "checklist": {
    "introductionBypass": boolean,
    "needsQualification": boolean,
    "machineSpecs": boolean,
    "priceLogistics": boolean,
    "objectionHandling": boolean,
    "followUpSecure": boolean,
    "nextSteps": boolean
  },
  "objectionsHandled": [
    { "objection": "Name of objection (e.g. Used risk) in Spanish", "handledWell": boolean, "feedback": "Brief feedback in Spanish" }
  ],
  "recommendations": ["Recommendation 1 in Spanish", "Recommendation 2 in Spanish", ...]
}`
            }
          ],
          systemInstruction: "You are a strict construction machinery sales auditor. Analyze the transcript and output ONLY valid JSON matching the requested schema. Do not write any markdown code blocks, just raw JSON."
        })
      });

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

      setEvaluation(parsedData);
    } catch (error: any) {
      console.error("Evaluation error:", error);
      setEvaluation({
        score: 0,
        summary: "Failed to generate AI evaluation due to an error.",
        strengths: ["Evaluation failed to run"],
        weaknesses: ["Error connecting to Gemini API: " + error.message],
        checklist: {
          introductionBypass: false,
          needsQualification: false,
          machineSpecs: false,
          priceLogistics: false,
          objectionHandling: false,
          followUpSecure: false,
          nextSteps: false
        },
        objectionsHandled: [],
        recommendations: ["Ensure your internet is working and try again."]
      });
    } finally {
      setEvaluating(false);
    }
  };

  if (showEvaluation) {
    return (
      <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 bg-slate-50 overflow-y-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Call Performance Scorecard</h2>
              <p className="text-slate-500 text-sm mt-0.5">Automated AI critique based on construction sales guidelines</p>
            </div>
          </div>
          <button
            onClick={handleResetCall}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Try Another Call
          </button>
        </div>

        {evaluating ? (
          <div className="bg-white rounded-3xl p-16 shadow-sm border border-slate-200 flex flex-col items-center justify-center space-y-6">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
              <div className="absolute w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-center space-y-2 max-w-md">
              <h3 className="text-xl font-bold text-slate-800 animate-pulse">Auditing Call Transcript...</h3>
              <p className="text-slate-500 text-sm">
                Gemini is checking your call flow against aggregate sales objections and qualification checklists.
              </p>
            </div>
          </div>
        ) : evaluation && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Score & Summary Column */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Score Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col items-center text-center space-y-4">
                <h3 className="font-bold text-slate-700 text-sm tracking-wider uppercase">Overall Score</h3>
                
                {/* SVG Ring Progress */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      className="text-slate-100"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    {/* Foreground Circle */}
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      strokeWidth="10"
                      strokeDasharray={377}
                      strokeDashoffset={377 - (377 * Math.min(Math.max(evaluation.score, 0), 100)) / 100}
                      strokeLinecap="round"
                      stroke={
                        evaluation.score >= 80 
                          ? "#10B981" // emerald-500
                          : evaluation.score >= 60 
                            ? "#F59E0B" // amber-500
                            : "#EF4444" // red-500
                      }
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold text-slate-900">{evaluation.score}</span>
                    <span className="text-xs text-slate-400 font-semibold uppercase">/ 100</span>
                  </div>
                </div>

                <div className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-700"
                  style={{
                    backgroundColor: evaluation.score >= 80 ? '#ECFDF5' : evaluation.score >= 60 ? '#FFFBEB' : '#FEF2F2',
                    color: evaluation.score >= 80 ? '#047857' : evaluation.score >= 60 ? '#B45309' : '#B91C1C'
                  }}
                >
                  {evaluation.score >= 80 ? 'Excellent' : evaluation.score >= 60 ? 'Satisfactory' : 'Needs Improvement'}
                </div>

                <p className="text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4 w-full">
                  {evaluation.summary}
                </p>
              </div>

              {/* Qualification Checklist */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Sales Process Checklist</h3>
                
                <div className="space-y-3">
                  {(callObjective === 'sell' ? [
                    { key: 'introductionBypass', label: 'Introducción y Bypass' },
                    { key: 'needsQualification', label: 'Calificación de Necesidades' },
                    { key: 'machineSpecs', label: 'Presentación de la Máquina' },
                    { key: 'priceLogistics', label: 'Discusión de Precio y Logística' },
                    { key: 'objectionHandling', label: 'Manejo de Objeciones' },
                    { key: 'followUpSecure', label: 'Contacto de Seguimiento' },
                    { key: 'nextSteps', label: 'Próximos Pasos Acordados' }
                  ] : [
                    { key: 'introductionBypass', label: 'Identificación de Decisor' },
                    { key: 'needsQualification', label: 'Estado y Motivo de Venta' },
                    { key: 'machineSpecs', label: 'Especificaciones y Horas' },
                    { key: 'priceLogistics', label: 'Precio Pretendido y Ubicación' },
                    { key: 'objectionHandling', label: 'Objeciones del Vendedor' },
                    { key: 'followUpSecure', label: 'Contacto para Fotos/Oferta' },
                    { key: 'nextSteps', label: 'Pasos para Inspección/Oferta' }
                  ]).map((item) => {
                    const checked = evaluation.checklist?.[item.key] === true;
                    return (
                      <div key={item.key} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 text-left pr-2">{item.label}</span>
                        <div className={`p-1 rounded-full shrink-0 ${checked ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                          {checked ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Critique Details Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Strengths Card */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <ThumbsUp className="w-5 h-5" />
                    <span>What Went Well</span>
                  </div>
                  <ul className="space-y-2">
                    {evaluation.strengths?.map((str: string, idx: number) => (
                      <li key={idx} className="text-slate-700 text-sm flex gap-2">
                        <span className="text-emerald-500 font-bold select-none">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                    {(!evaluation.strengths || evaluation.strengths.length === 0) && (
                      <li className="text-slate-400 text-sm italic">No significant strengths recorded.</li>
                    )}
                  </ul>
                </div>

                {/* Weaknesses Card */}
                <div className="bg-rose-50/50 border border-rose-100 rounded-3xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-rose-800 font-bold">
                    <ThumbsDown className="w-5 h-5" />
                    <span>Areas for Improvement</span>
                  </div>
                  <ul className="space-y-2">
                    {evaluation.weaknesses?.map((weak: string, idx: number) => (
                      <li key={idx} className="text-slate-700 text-sm flex gap-2">
                        <span className="text-rose-400 font-bold select-none">•</span>
                        <span>{weak}</span>
                      </li>
                    ))}
                    {(!evaluation.weaknesses || evaluation.weaknesses.length === 0) && (
                      <li className="text-slate-400 text-sm italic">No specific weaknesses recorded.</li>
                    )}
                  </ul>
                </div>

              </div>

              {/* Objections Handled Feedback */}
              {evaluation.objectionsHandled && evaluation.objectionsHandled.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Objection Handling Review</h3>
                  <div className="space-y-4">
                    {evaluation.objectionsHandled.map((obj: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-sm">{obj.objection}</span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            obj.handledWell 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {obj.handledWell ? <ThumbsUp className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            {obj.handledWell ? 'Handled Well' : 'Needs Practice'}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{obj.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Recommendations */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Recommendations & Correct script flow</h3>
                <div className="space-y-3">
                  {evaluation.recommendations?.map((rec: string, idx: number) => (
                    <div key={idx} className="flex gap-3 text-sm">
                      <div className="shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <p className="text-slate-700 mt-0.5 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* View Transcript Toggle */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="w-full flex items-center justify-between text-slate-700 font-medium px-2 py-1 text-sm hover:text-slate-900 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Review Call Transcript ({transcripts.length} lines)
                  </span>
                  {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showTranscript && (
                  <div className="mt-4 border-t border-slate-100 pt-4 max-h-[300px] overflow-y-auto space-y-3">
                    {transcripts.map((msg) => (
                      <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-600'}`}>
                          {msg.role === 'user' ? 'U' : 'P'}
                        </div>
                        <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                          <div className={`inline-block max-w-[85%] rounded-2xl px-3.5 py-1.5 text-xs text-left ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 bg-slate-50 overflow-hidden">
      <div className="max-w-5xl w-full flex flex-col md:flex-row h-full gap-6">
        
        {/* Call Controls */}
        <div className="md:w-1/3 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 text-center space-y-6 shrink-0 flex flex-col justify-start overflow-y-auto max-h-full">
          <div className="space-y-1">
            <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Live Voice Call</h2>
            <p className="text-slate-500 text-xs">
              Simulate a phone call. Choose parameters below and practice buying or selling a machine.
            </p>
          </div>

          {/* Configuration Form (only when not active) */}
          {!isConnected && !isConnecting && (
            <div className="text-left space-y-3 w-full bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Sim Config</h4>
              
              {/* Objetivo (Venta / Compra) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Call Objective / Objetivo</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCallObjective('sell')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      callObjective === 'sell'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    We Sell (Vender)
                  </button>
                  <button
                    onClick={() => setCallObjective('buy')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      callObjective === 'buy'
                        ? 'bg-purple-50 border-purple-300 text-purple-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    We Buy (Comprar)
                  </button>
                </div>
              </div>

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
                <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Difficulty</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDifficulty('friendly')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      difficulty === 'friendly'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Friendly
                  </button>
                  <button
                    onClick={() => setDifficulty('tough')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      difficulty === 'tough'
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Tough / Obstacles
                  </button>
                </div>
              </div>

              {/* Máquina */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Machine to Sell</label>
                <select
                  value={isCustomMachine ? 'custom' : machineModel}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomMachine(true);
                    } else {
                      setIsCustomMachine(false);
                      setMachineModel(e.target.value);
                    }
                  }}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Kleemann MOBIREX MR 130">Kleemann MOBIREX MR 130 (Crusher)</option>
                  <option value="Toyota 8FGU25 Forklift">Toyota 8FGU25 Forklift</option>
                  <option value="Caterpillar 320 Excavator">Caterpillar 320 Excavator</option>
                  <option value="custom">Other (Customize...)</option>
                </select>
                {isCustomMachine && (
                  <input
                    type="text"
                    placeholder="e.g., Bobcat S450 Skid Steer"
                    value={customMachine}
                    onChange={(e) => setCustomMachine(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 mt-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                )}
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
            </div>
          )}

          <div className="min-h-[60px] flex items-center justify-center">
            {isConnecting && (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <p className="text-xs font-semibold animate-pulse">Connecting...</p>
              </div>
            )}
            {isConnected && (
              <div className="flex flex-col items-center gap-2">
                 {conversation.isSpeaking ? (
                   <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                     <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                     <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                     <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                   </div>
                 ) : (
                   <div className="text-xs text-slate-500 font-medium animate-pulse">
                     Listening / Processing...
                   </div>
                 )}
                 <p className="text-[10px] text-slate-400">
                   Speak clearly into your microphone
                 </p>
              </div>
            )}
            {!isConnected && !isConnecting && (
               <div className="flex flex-col items-center text-slate-400 text-xs">
                 <p>Ready to call</p>
               </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-center gap-3 shrink-0">
            {!isConnected && !isConnecting && (
              <button
                onClick={handleStartCall}
                className="px-6 py-2.5 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-transform hover:scale-102 shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Phone className="w-4 h-4" />
                Start Call
              </button>
            )}

            {(isConnected || isConnecting) && (
              <button
                onClick={handleEndCall}
                className="px-6 py-2.5 w-full bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-transform hover:scale-102 shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Phone className="w-4 h-4 fill-current rotate-[135deg]" />
                End Call
              </button>
            )}
          </div>
        </div>

        {/* Transcript Area */}
        <div className="md:w-2/3 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-0">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <h3 className="font-semibold text-slate-700">Live Transcript</h3>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {transcripts.length === 0 ? (
               <div className="h-full flex items-center justify-center text-slate-400 text-sm text-center">
                 Initiate the call and speak to see the live transcript here.
               </div>
            ) : (
               transcripts.map((msg) => (
                 <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-600'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                       <div className={`inline-block max-w-[85%] rounded-2xl px-4 py-2.5 text-sm text-left ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
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

export default function LiveCall() {
  return (
    <ConversationProvider>
      <ElevenLabsCallView />
    </ConversationProvider>
  );
}
