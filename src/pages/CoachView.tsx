import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { getSystemInstruction } from '../instructions';
import { api } from '../services/api';
import Playbook from '../Playbook';
import ReactMarkdown from 'react-markdown';
import { 
  Send, User, Bot, Loader2, Mic, MicOff, BookOpen, 
  Sparkles, Terminal, Volume2, HelpCircle, ArrowRight
} from 'lucide-react';

interface CoachViewProps {
  voiceEnabled: boolean;
  onResetRef?: React.MutableRefObject<(() => void) | null>;
}

const INITIAL_MESSAGE: Message = {
  role: 'model',
  content: `### TERMINAL DE ENTRENAMIENTO COMERCIAL // JYC EQUIPMENT

Bienvenido a la consola de inteligencia de ventas para la **compra y adquisición de maquinaria pesada**.

#### Capacidades del Entrenador:
- **Técnicas de Bypass:** Cómo superar al operador/recepcionista y conectar con el *Jefe de Planta / Operaciones / Flota*.
- **Apertura con KP:** Aplicación del gancho correcto y pregunta de respeto de tiempo.
- **Calificación en 7 pasos:** Tipo de equipo, marca, modelo, capacidad/tonelaje, año, estado/reparaciones y precio pretendido con fotos.
- **Neutralización de Objeciones:** Subastas, consignaciones, contratos de leasing o exigencia de precio inicial.

*Selecciona un escenario rápido abajo o escribe tu consulta comercial:*`
};

const SCENARIO_CHIPS = [
  "¿Cómo responder si el prospecto dice 'Nosotros solo vendemos en subastas'?",
  "Dame el guion exacto de bypass para la operadora en una planta de plásticos",
  "¿Cómo pedir fotos de la placa de datos y horómetro sin parecer insistente?",
  "El prospecto dice 'Dime cuánto me pagas tú primero'. ¿Qué respondo?",
  "Si no tienen máquinas a la venta hoy, ¿qué preguntas de referencia hago?"
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
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz Web Speech API.");
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
    recognitionRef.current.lang = 'es-ES';

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
        { role: 'model', content: `**Error de terminal:** ${err.message || 'No se pudo generar respuesta.'}` }
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
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 h-full overflow-hidden bg-[#080B10]">
      
      {/* Mobile Playbook Toggle Bar */}
      <div className="lg:hidden bg-[#0B1017] border-b border-[#1C2634] px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          TERMINAL DE ENTRENAMIENTO
        </span>
        <button
          onClick={() => setShowPlaybookMobile(!showPlaybookMobile)}
          className="text-xs font-mono font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 py-1 px-2.5 rounded bg-sky-950/60 border border-sky-500/40"
        >
          <BookOpen className="w-3.5 h-3.5" />
          {showPlaybookMobile ? 'VER CHAT' : 'VER PLAYBOOK'}
        </button>
      </div>

      {/* Main Terminal Chat Pane */}
      <div className={`flex-1 flex flex-col min-w-0 h-full border-r border-[#151D29] bg-[#070A0F] ${
        showPlaybookMobile ? 'hidden lg:flex' : 'flex'
      }`}>
        
        {/* Scenario Quick Launcher Strip */}
        <div className="px-4 py-2.5 bg-[#0A0E15] border-b border-[#151D29] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400" /> ESCENARIOS:
          </span>
          {SCENARIO_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(chip)}
              disabled={loading}
              className="text-[11px] font-mono whitespace-nowrap px-2.5 py-1 rounded bg-[#0F1520] hover:bg-[#162030] text-slate-300 hover:text-white border border-[#1E293B] hover:border-sky-500/50 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Dialogue Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 dark-scrollbar">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-3 max-w-4xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar Pill */}
              <div 
                className={`shrink-0 w-8 h-8 rounded flex items-center justify-center font-mono font-bold text-xs ${
                  msg.role === 'user' 
                    ? 'bg-blue-900/60 text-blue-200 border border-blue-500/40' 
                    : 'bg-sky-950/60 text-sky-300 border border-sky-500/40'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`min-w-0 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div 
                  className={`inline-block rounded px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-lg ${
                    msg.role === 'user'
                      ? 'bg-[#152238] border border-blue-500/40 text-slate-100 font-medium text-left'
                      : 'bg-[#0D121B] border border-[#1C2634] text-slate-200'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                  ) : (
                    <div className="markdown-body prose prose-invert prose-xs sm:prose-sm max-w-none text-slate-200">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-3xl mr-auto items-center">
              <div className="w-8 h-8 rounded bg-sky-950/60 border border-sky-500/40 text-sky-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#0D121B] border border-[#1C2634] px-4 py-2.5 rounded text-xs font-mono text-slate-400 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>Consultando Playbook de Maquinaria JYC y generando respuesta técnica...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-[#0A0E15] border-t border-[#151D29]">
          <div className="max-w-4xl mx-auto flex items-end gap-2">
            <button
              onClick={toggleRecording}
              className={`p-2.5 rounded border transition-all cursor-pointer shrink-0 ${
                isRecording
                  ? 'bg-red-950/80 border-red-500 text-red-400 animate-pulse'
                  : 'bg-[#0E141D] border-[#1C2634] text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={isRecording ? 'Detener dictado' : 'Hablar por micrófono'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Escribe tu consulta de ventas, objeción o argumento... (Enter para enviar)"
                className="w-full resize-none border border-[#1E293B] focus:border-sky-500 rounded px-3.5 py-2.5 text-xs sm:text-sm bg-[#070A0F] text-slate-100 placeholder:text-slate-500 outline-none transition-all max-h-36 min-h-[44px] font-sans"
                rows={1}
              />
            </div>

            <button
              onClick={() => handleSendPrompt(input)}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded bg-sky-600 hover:bg-sky-500 text-black font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-md shadow-sky-600/20"
              title="Enviar consulta"
            >
              <Send className="w-4 h-4 fill-current" />
            </button>
          </div>
          <div className="max-w-4xl mx-auto mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
            <span>Shift + Enter para salto de línea</span>
            <span className="hidden sm:inline">MOTOR IA: GEMINI 2.5/3.5 FLASH • CONTEXTO B2B JYC</span>
          </div>
        </div>
      </div>

      {/* Playbook Sidebar Pane (Field Dossier) */}
      <div className={`lg:w-[480px] xl:w-[520px] h-full shrink-0 border-l border-[#151D29] bg-[#070A0F] overflow-hidden ${
        showPlaybookMobile ? 'w-full flex-1' : 'hidden lg:block'
      }`}>
        <Playbook />
      </div>
    </div>
  );
}
