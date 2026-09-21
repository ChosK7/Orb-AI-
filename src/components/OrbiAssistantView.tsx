import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AIActionPayload } from '../types';
import { OrbiLogo } from './OrbiLogo';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Shield,
  HelpCircle,
  CornerDownLeft,
} from 'lucide-react';
import { speakText, stopSpeaking, playChime } from '../utils/audio';

interface OrbiAssistantViewProps {
  messages: ChatMessage[];
  pendingConfirmation: AIActionPayload | null;
  onSendMessage: (text: string) => Promise<void>;
  onConfirmAction: (action: AIActionPayload) => void;
  onRejectAction: () => void;
  voiceEnabled: boolean;
}

export const OrbiAssistantView: React.FC<OrbiAssistantViewProps> = ({
  messages,
  pendingConfirmation,
  onSendMessage,
  onConfirmAction,
  onRejectAction,
  voiceEnabled,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingConfirmation]);

  // Quick preset prompts from specification item 8
  const quickPrompts = [
    'Organize meu dia hoje',
    'Agende uma reunião com João às 15h',
    'Lembre-me de pagar a conta de luz amanhã',
    'Quanto gastei este mês?',
    'Estou sobrecarregado, me ajude a priorizar',
    'Gastei R$ 42 na padaria',
  ];

  // Speech Recognition Setup (Web Speech API)
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'Reconhecimento de voz contínuo do navegador não suportado neste dispositivo. Digite seu comando diretamente no campo de texto.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        playChime('chime');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // Auto send on voice complete
        handleSend(transcript);
      };

      recognition.onerror = (e: any) => {
        console.error('Speech recognition error', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    setInputText('');
    setIsLoading(true);
    playChime('chime');

    try {
      await onSendMessage(query);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadAloud = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(text);
      // reset state after reasonable duration
      setTimeout(() => setIsSpeaking(false), 8000);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-120px)] max-w-3xl mx-auto animate-in fade-in duration-300">
      {/* Assistant Header */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 mb-3 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <OrbiLogo size="sm" animate={isLoading} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Orbi AI Assistente</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">
              {isLoading ? 'Orbi está pensando...' : 'Pronto para gerenciar seu tempo, tarefas e finanças.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {voiceEnabled && (
            <button
              onClick={() => handleReadAloud('Olá! Eu sou o Orbi. Como posso equilibrar o seu dia hoje?')}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
              title="Testar voz do Orbi"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Message Chat Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 pr-2 pb-4 text-xs">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                <p className="text-xs">{msg.text}</p>

                {!isUser && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                    <span className="font-mono">{msg.timestamp}</span>
                    <button
                      onClick={() => handleReadAloud(msg.text)}
                      className="text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
                      title="Ouvir resposta"
                    >
                      <Volume2 className="w-3 h-3" /> Ouvir
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* LOADING TYPING INDICATOR */}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-100" />
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-200" />
            <span className="text-[11px] text-slate-500">Orbi analisando contexto...</span>
          </div>
        )}

        {/* MANDATORY CONFIRMATION CARD (Prompt item 4: SUGERIR → EXPLICAR → CONFIRMAR → EXECUTAR) */}
        {pendingConfirmation && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/50 border-2 border-indigo-500/60 shadow-xl shadow-indigo-950/30 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-indigo-300 font-bold mb-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Confirmação Explícita Requerida</span>
            </div>

            <p className="text-xs text-slate-200 mb-3 leading-relaxed">
              O Orbi preparou a seguinte ação com base no seu pedido:
            </p>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-xs space-y-1 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Tipo de Ação:</span>
                <span className="font-bold text-white uppercase text-[10px] px-2 py-0.5 rounded bg-indigo-500/20">
                  {pendingConfirmation.type}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400 font-semibold">Resumo:</span>
                <span className="font-semibold text-slate-200">{pendingConfirmation.description}</span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={onRejectAction}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
              >
                <XCircle className="w-4 h-4 text-slate-400" />
                Cancelar
              </button>

              <button
                onClick={() => onConfirmAction(pendingConfirmation)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-bold hover:opacity-95 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                Confirmar & Executar
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="py-2 overflow-x-auto no-scrollbar flex gap-2 shrink-0">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white text-[11px] whitespace-nowrap transition-all shrink-0 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Field & Microphone */}
      <div className="pt-1 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-indigo-500/80 shadow-lg transition-colors"
        >
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2.5 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-950 text-slate-400 hover:text-indigo-400 hover:bg-slate-800'
            }`}
            title={isListening ? 'Ouvindo... toque para parar' : 'Falar com o Orbi (Microfone)'}
          >
            {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? 'Ouvindo sua voz...'
                : 'Ex: "Agende reunião amanhã às 14h" ou "Gastei R$ 50"...'
            }
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none px-2"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-md shadow-indigo-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex justify-between items-center px-2 pt-1 text-[10px] text-slate-500">
          <span>Sua vida em equilíbrio inteligente.</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-indigo-400" /> Ações críticas sempre pedem confirmação
          </span>
        </div>
      </div>
    </div>
  );
};
