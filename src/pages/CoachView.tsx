import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { getSystemInstruction } from '../instructions';
import { api } from '../services/api';
import Playbook from '../Playbook';
import ReactMarkdown from 'react-markdown';
import { 
  Send, User, Bot, Loader2, Mic, MicOff, BookOpen, MessageSquare
} from 'lucide-react';

interface CoachViewProps {
  voiceEnabled: boolean;
  onResetRef?: React.MutableRefObject<(() => void) | null>;
}

const INITIAL_MESSAGE: Message = {
  role: 'model',
  content: `### JYC Equipment Sales Coach

I am here to help you prepare your heavy machinery acquisition and outbound sales calls.

You can ask me about:
- **How to bypass reception (gatekeeper)** and get directly transferred to the plant or operations manager.
- **Openings and commercial hooks** tailored to each sector (plastics, ports, concrete, steel, medical).
- **The 7 qualification questions** to evaluate injection molders, wheel loaders, or reach stackers.
- **How to overcome objections** regarding price, auctions, trade-in, or leasing.

Choose a frequent question below or type your inquiry:`
};

const SCENARIO_CHIPS = [
  "What do I say if they say 'We only sell through auctions'?",
  "Give me the script to bypass reception at a plastics plant",
  "How do I naturally ask for photos of the data plate and hour meter?",
  "The prospect says 'Tell me your offer first'. What should I reply?",
  "If they don't have machinery for sale today, what questions should I ask?"
];

export default function CoachView({ voiceEnabled, onResetRef }: CoachViewProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showPlaybookMobile, setShowPlaybookMobile] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (onResetRef) {
      onResetRef.current = () => {
        setMessages([INITIAL_MESSAGE]);
        setInput('');
      };
    }
  }, [onResetRef]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const speakText = (text: string) => {
    if (!voiceEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_~`#\[\]]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice dictation.");
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
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => setIsRecording(true);
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognitionRef.current.onerror = () => setIsRecording(false);
    recognitionRef.current.onend = () => setIsRecording(false);

    recognitionRef.current.start();
  };

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: promptText.trim() };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = newMessages.filter((m, idx) => {
        if (idx === 0 && m.role === 'model') return false;
        return true;
      });

      const systemInstruction = getSystemInstruction('Coach');
      const botResponse = await api.sendChatMessage(apiMessages, systemInstruction);

      const updated = [...newMessages, { role: 'model' as const, content: botResponse }];
      setMessages(updated);
      speakText(botResponse);
    } catch (err: any) {
      console.error(err);
      setMessages([
        ...newMessages,
        { role: 'model', content: `Could not retrieve response at this time: ${err.message || 'Please try again.'}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt(input);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 h-full overflow-hidden bg-[#F4F6F9]">
      
      {/* Mobile Switcher Bar */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">
          {showPlaybookMobile ? 'Sales Playbook' : 'Sales Coach'}
        </span>
        <button
          onClick={() => setShowPlaybookMobile(!showPlaybookMobile)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-50 border border-blue-200 cursor-pointer"
        >
          {showPlaybookMobile ? (
            <>
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Go to Coach Chat</span>
            </>
          ) : (
            <>
              <BookOpen className="w-3.5 h-3.5" />
              <span>View Full Playbook</span>
            </>
          )}
        </button>
      </div>

      {/* Left Pane: AI Coach Conversation */}
      <div className={`flex-1 flex flex-col min-w-0 h-full ${
        showPlaybookMobile ? 'hidden lg:flex' : 'flex'
      }`}>
        
        {/* Frequent Questions Bar */}
        <div className="px-4 sm:px-6 py-3 bg-white border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-xs font-semibold text-slate-500 shrink-0">
            Frequently asked questions:
          </span>
          {SCENARIO_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(chip)}
              disabled={loading}
              className="text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-3 max-w-3xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div 
                className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-900 text-amber-400'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`min-w-0 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div 
                  className={`inline-block rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white text-left'
                      : 'bg-white border border-slate-200/90 text-slate-800'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div className="markdown-body max-w-none text-slate-700">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-2xl mr-auto items-center">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl text-xs font-medium text-slate-600 flex items-center gap-2 shadow-2xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                <span>Preparing sales recommendation...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <div className="p-4 bg-white border-t border-slate-200/80">
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <button
              onClick={toggleRecording}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                isRecording
                  ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={isRecording ? 'Stop dictation' : 'Dictate via microphone'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a prospect objection or question about the script..."
                className="w-full resize-none border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-900 placeholder:text-slate-400 outline-none transition-all max-h-36 min-h-[42px]"
                rows={1}
              />
            </div>

            <button
              onClick={() => handleSendPrompt(input)}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-xs"
              title="Send inquiry"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Pane: Playbook Guide */}
      <div className={`lg:w-[460px] xl:w-[500px] h-full shrink-0 p-4 lg:pl-0 overflow-hidden ${
        showPlaybookMobile ? 'w-full flex-1' : 'hidden lg:block'
      }`}>
        <Playbook />
      </div>
    </div>
  );
}
