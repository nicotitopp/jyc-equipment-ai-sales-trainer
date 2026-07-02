import React, { useState, useRef, useEffect } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { 
  PhoneCall, Phone, Mic, MicOff, Loader2, Bot, User
} from 'lucide-react';
import Scorecard from './Scorecard';

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
      
      // Determine the first message greeting in the correct language
      const greeting = language === 'English'
        ? `Good morning, thank you for calling ${companyName}. How can I help you?`
        : `Buenos días, gracias por llamar a ${companyName}. ¿En qué le puedo ayudar?`;

      await conversation.startSession({
        agentId: "agent_2501kw2zhyq8ewg9ntqm1613vhek",
        dynamicVariables: {
          difficulty: difficulty,
          language: language,
          first_message: greeting,
          contact_name: contactName || "Carlos",
          company_name: companyName || "Canteras del Norte"
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
      const transcriptText = transcripts
        .map(t => `${t.role === 'user' ? 'Trainee (Sales Rep)' : 'Prospect'}: ${t.text}`)
        .join('\n');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Please evaluate this sales/purchasing cold call transcript. The representative is a buyer from JYC Equipment contacting a prospect named "${contactName}" representing "${companyName}" regarding used heavy machinery.
The representative's primary goal is to BUY used heavy equipment (forklifts, wheel loaders, excavators, crushers, etc.) from the company.

The entire call was conducted in ${language}. You must write all critique details (strengths, weaknesses, objectionsHandled feedback, recommendations) in the user's primary language: Spanish.

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
      />
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
