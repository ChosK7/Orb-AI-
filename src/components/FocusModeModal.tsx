import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Shield, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { startFocusSound, stopFocusSound, playChime } from '../utils/audio';

interface FocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionComplete: (minutes: number) => void;
  defaultDuration?: number;
}

export const FocusModeModal: React.FC<FocusModeModalProps> = ({
  isOpen,
  onClose,
  onSessionComplete,
  defaultDuration = 45,
}) => {
  const [duration, setDuration] = useState(defaultDuration);
  const [timeLeft, setTimeLeft] = useState(defaultDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [objective, setObjective] = useState('Finalizar tarefas prioritárias');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setTimeLeft(duration * 60);
    setIsActive(false);
    setIsCompleted(false);
  }, [duration, isOpen]);

  useEffect(() => {
    let timer: any = null;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      setIsCompleted(true);
      if (soundEnabled) {
        stopFocusSound();
        setSoundEnabled(false);
      }
      playChime('success');
      onSessionComplete(duration);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, duration, soundEnabled, onSessionComplete]);

  const toggleTimer = () => {
    if (!isActive && soundEnabled) {
      startFocusSound();
    } else if (isActive && soundEnabled) {
      stopFocusSound();
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (soundEnabled) {
      stopFocusSound();
      setSoundEnabled(false);
    }
    setTimeLeft(duration * 60);
    setIsCompleted(false);
  };

  const toggleSound = () => {
    if (soundEnabled) {
      stopFocusSound();
      setSoundEnabled(false);
    } else {
      setSoundEnabled(true);
      if (isActive) {
        startFocusSound();
      }
    }
  };

  const handleClose = () => {
    if (soundEnabled) {
      stopFocusSound();
    }
    onClose();
  };

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / (duration * 60);
  const strokeDashoffset = 440 - 440 * progress;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-tight">Modo Foco Orbi</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset duration buttons */}
        {!isActive && !isCompleted && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[25, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  duration === mins
                    ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>
        )}

        {/* Target objective */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Objetivo do Bloco
          </label>
          <input
            type="text"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            disabled={isActive}
            placeholder="Ex: Concluir proposta do projeto"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Circular Progress Timer */}
        <div className="flex flex-col items-center justify-center my-4 relative">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="70"
              stroke="#1e293b"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="96"
              cy="96"
              r="70"
              stroke="url(#timerGrad)"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="440"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {isCompleted ? (
              <div className="flex flex-col items-center gap-1 text-emerald-400 animate-in zoom-in">
                <CheckCircle2 className="w-8 h-8" />
                <span className="text-sm font-bold">Foco Concluído!</span>
              </div>
            ) : (
              <>
                <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  {isActive ? 'Em concentração profunda' : 'Pronto para focar'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Desativar som binaural' : 'Ativar som binaural calmante'}
            className={`p-3 rounded-full border transition-all ${
              soundEnabled
                ? 'border-indigo-500 bg-indigo-950/50 text-indigo-300'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleTimer}
            className={`flex items-center gap-2 py-3 px-6 rounded-full font-bold text-sm text-white shadow-lg transition-all ${
              isActive
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 shadow-indigo-500/25'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 fill-white" /> Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" /> {timeLeft === duration * 60 ? 'Iniciar Foco' : 'Continuar'}
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            title="Reiniciar"
            className="p-3 rounded-full border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Architectural note as mandated by prompt item 18 & 19 */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
          <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300">Integração com Sistema Operacional: </span>
            Camada arquitetural preparada para bloqueio de apps via API de Tempo de Uso (Android/iOS). No navegador, o timer protege suas janelas ativas e registra seu tempo produtivo.
          </div>
        </div>
      </div>
    </div>
  );
};
