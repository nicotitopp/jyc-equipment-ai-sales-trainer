import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { getSystemInstruction } from '../instructions';
import { api } from '../services/api';
import Playbook from '../Playbook';
import ReactMarkdown from 'react-markdown';
import { 
  Send, User, Bot, Loader2, Mic, MicOff, BookOpen, 
  Sparkles, CornerDownLeft, Volume2
} from 'lucide-react';

interface CoachViewProps {
  voiceEnabled: boolean;
  onResetRef?: React.MutableRefObject<(() => void) | null>;
}

const INITIAL_MESSAGE: Message = {
  role: 'model',
  content: `¡Hola! Soy tu **Coach de Ventas de JYC Equipment** para la compra y adquisición de maquinaria pesada.

Estoy aquí para ayudarte a dominar el proceso de prospección:
- **Calificación de maquinaria:** Cómo preguntar año, marca, modelo, horómetro y estado.
- **Manejo de objeciones:** Qué decir ante intermediarios, subastas, consignaciones o solicitudes de precio anticipado.
- **Guiones por industria:** Puertos, minería, plásticos y sector médico.

*¿Qué situación o industria te gustaría practicar hoy?*`
};

export default function CoachView({ voiceEnabled, onResetRef }: CoachViewProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showPlaybookMobile, setShowPlaybookMobile] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Expose reset function
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

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
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
        { role: 'model', content: `**Error de conexión:** ${err.message || 'No se pudo generar respuesta.'}` }
      ]);
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
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 h-full overflow-hidden bg-slate-50">
      
      {/* Mobile Playbook Toggle Bar */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Modo Interactivo de Entrenamiento
        </span>
        <button
          onClick={() => setShowPlaybookMobile(!showPlaybookMobile)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 py-1 px-2.5 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          {showPlaybookMobile ? 'Volver al Chat' : 'Ver Playbook'}
        </button>
      </div>

      {/* Main Chat Pane */}
      <div className={`flex-1 flex flex-col min-w-0 h-full border-r border-slate-200 bg-white ${
        showPlaybookMobile ? 'hidden lg:flex' : 'flex'
      }`}>
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-3 max-w-3xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div 
                className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  msg.role === 'user' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-blue-600 text-white shadow-xs'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`min-w-0 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div 
                  className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white text-left font-medium'
                      : 'bg-slate-50 border border-slate-200/90 text-slate-800 shadow-xs'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div className="markdown-body prose prose-slate prose-sm max-w-none text-slate-800">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-3xl mr-auto items-center">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl text-xs text-slate-600 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Analizando guiones y generando respuesta...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <button
              onClick={toggleRecording}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                isRecording
                  ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
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
                placeholder="Escribe tu consulta o argumento de ventas... (Enter para enviar)"
                className="w-full resize-none border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/60 focus:bg-white text-slate-900 placeholder:text-slate-400 outline-none transition-all max-h-36 min-h-[44px]"
                rows={1}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-xs"
              title="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="max-w-3xl mx-auto mt-1.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Shift + Enter para salto de línea</span>
            <span className="hidden sm:inline">Conocimiento JYC: Puertos, Maquinaria, Plásticos, Médico</span>
          </div>
        </div>
      </div>

      {/* Playbook Sidebar Pane (Desktop always visible, Mobile modal/toggle) */}
      <div className={`lg:w-[460px] xl:w-[500px] h-full shrink-0 border-l border-slate-200 bg-slate-50/70 overflow-hidden ${
        showPlaybookMobile ? 'w-full flex-1' : 'hidden lg:block'
      }`}>
        <Playbook />
      </div>
    </div>
  );
}
