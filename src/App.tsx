import React, { useState, useRef, useEffect } from 'react';
import { Mode, Message } from './types';
import { getSystemInstruction } from './instructions';
import { Send, User, Bot, RefreshCw, GraduationCap, Briefcase, ClipboardCheck, PhoneCall, Loader2, Menu, X, Mic, Volume2, VolumeX, MicOff, UploadCloud } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import LiveCall from './LiveCall';
import RealCallAudit from './RealCallAudit';

const MODES: { id: Mode; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'Coach', label: 'Coach', icon: <GraduationCap className="w-5 h-5" />, description: 'Get explanations and practical examples.' },
  { id: 'Live Call Simulation', label: 'Live Call', icon: <PhoneCall className="w-5 h-5" />, description: 'Simulate a full end-to-end sales call.' },
  { id: 'Real Call Audit', label: 'Audit Call', icon: <UploadCloud className="w-5 h-5" />, description: 'Upload a recording of a real call to get feedback.' },
];

export default function App() {
  const [mode, setMode] = useState<Mode>('Coach');

  // Store separate message histories for each chat mode
  const [modeMessages, setModeMessages] = useState<Record<string, Message[]>>({
    'Coach': [
      { role: 'model', content: "Hello! I am your JYC Equipment AI Sales Trainer.\n\nI'm ready to help you learn the ropes. We can start by practicing how to qualify equipment, handling objections, or just discussing the sales process.\n\nWhat would you like to focus on today?" }
    ]
  });

  const currentMessages = mode !== 'Live Call Simulation' ? (modeMessages[mode] || []) : [];

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Web Speech API states
  const [isRecording, setIsRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (mode === 'Live Call Simulation') {
      setVoiceEnabled(true);
    } else {
      setVoiceEnabled(false);
      window.speechSynthesis.cancel();
    }
  }, [mode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, loading]);

  const speakText = (text: string) => {
    if (!voiceEnabled && mode !== 'Live Call Simulation') return;
    
    window.speechSynthesis.cancel();
    
    // Strip markdown formatting for cleaner speech
    const cleanText = text.replace(/[*_~`#\[\]]/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    window.speechSynthesis.speak(utterance);
  };

  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support the Web Speech API for dictation.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => setIsRecording(true);
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? prev + ' ' + transcript : transcript));
    };
    recognitionRef.current.onerror = () => setIsRecording(false);
    recognitionRef.current.onend = () => setIsRecording(false);

    recognitionRef.current.start();
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setSidebarOpen(false);
  };

  const handleReset = () => {
    if (mode === 'Live Call Simulation') return;
    const initialMessage = mode === 'Coach'
      ? "Hello! I am your JYC Equipment AI Sales Trainer.\n\nI'm ready to help you learn the ropes. We can start by practicing how to qualify equipment, handling objections, or just discussing the sales process.\n\nWhat would you like to focus on today?"
      : `Conversation reset. We are in **${mode}** mode.\n\nWhat would you like to do?`;
    const resetMsg: Message[] = [{ role: 'model', content: initialMessage }];
    setModeMessages(prev => ({
      ...prev,
      [mode]: resetMsg
    }));
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    if (mode === 'Live Call Simulation') return;

    const userMsg: Message = { role: 'user', content: input };
    const newMessages = [...currentMessages, userMsg];
    
    // Update local state for this mode immediately
    setModeMessages(prev => ({
      ...prev,
      [mode]: newMessages
    }));
    setInput('');
    setLoading(true);

    try {
      // Filter out the initial welcome message and any system notification messages
      // to ensure the conversation history sent to Gemini starts with a 'user' message and strictly alternates.
      const apiMessages = newMessages.filter((m, idx) => {
        if (idx === 0 && m.role === 'model') return false;
        if (m.content.startsWith('Switched to **') || m.content.startsWith('Conversation reset.')) return false;
        return true;
      });

      const systemInstruction = getSystemInstruction(mode);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          systemInstruction
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }

      const updatedMessages: Message[] = [...newMessages, { role: 'model', content: data.text }];
      setModeMessages(prev => ({
        ...prev,
        [mode]: updatedMessages
      }));
      speakText(data.text);

    } catch (err: any) {
      console.error(err);
      const errorMessages: Message[] = [...newMessages, { role: 'model', content: `**Error:** ${err.message || "An unexpected error occurred."}` }];
      setModeMessages(prev => ({
        ...prev,
        [mode]: errorMessages
      }));
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">JYC Equipment<br/><span className="text-blue-400 font-medium text-sm">AI Sales Trainer</span></h1>
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Training Modes</h2>
              <div className="space-y-1">
                {MODES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleModeChange(m.id)}
                    className={`w-full text-left px-3 py-3 rounded-lg flex flex-col gap-1 transition-colors ${mode === m.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      {m.icon}
                      <span className="font-medium">{m.label}</span>
                    </div>
                    <span className={`text-xs pl-8 ${mode === m.id ? 'text-blue-200' : 'text-slate-500'}`}>
                      {m.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="px-2">
              <button 
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Conversation
              </button>
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-800">
             <div className="text-xs text-slate-500 text-center">
               Internal Training Use Only
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <button 
               className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900"
               onClick={() => setSidebarOpen(true)}
             >
               <Menu className="w-6 h-6" />
             </button>
             <div>
               <h2 className="text-lg font-semibold text-slate-800">{mode}</h2>
               <p className="text-xs text-slate-500 hidden sm:block">{MODES.find(m => m.id === mode)?.description}</p>
             </div>
           </div>
           
           <button
             onClick={() => {
               const newVoice = !voiceEnabled;
               setVoiceEnabled(newVoice);
               if (!newVoice) {
                   window.speechSynthesis.cancel();
               }
             }}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
               voiceEnabled 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
             }`}
           >
             {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
             <span className="hidden sm:inline">{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
           </button>
        </header>

        {mode === 'Live Call Simulation' ? (
          <LiveCall />
        ) : mode === 'Real Call Audit' ? (
          <RealCallAudit />
        ) : (
          <>
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {currentMessages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-600'}`}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3 shadow-sm text-sm sm:text-base ${msg.role === 'user' ? 'bg-blue-600 text-white text-left' : 'bg-white border border-slate-200 text-slate-800'}`}>
                       {msg.role === 'user' ? (
                         <div className="whitespace-pre-wrap">{msg.content}</div>
                       ) : (
                         <div className="markdown-body prose prose-sm sm:prose-base max-w-none text-slate-800 prose-p:leading-relaxed prose-pre:bg-slate-100 prose-pre:text-slate-800">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                 <div className="flex gap-4 max-w-4xl mx-auto">
                   <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                     <Bot className="w-5 h-5" />
                   </div>
                   <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm flex items-center gap-2">
                     <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                     <span className="text-sm text-slate-500">Typing...</span>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-slate-200 p-4">
              <div className="max-w-4xl mx-auto flex gap-3 items-end">
                <button
                   onClick={toggleRecording}
                   className={`mb-1 shrink-0 p-3 rounded-xl transition-colors ${
                     isRecording 
                       ? 'bg-red-100 text-red-600 animate-pulse' 
                       : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                   }`}
                   title={isRecording ? "Stop recording" : "Start dictation"}
                >
                   {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  className="flex-1 max-h-48 min-h-[56px] resize-none border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-slate-50"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="mb-1 shrink-0 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
