import React, { useState } from 'react';
import { UserProfile } from '../types';
import { OrbiLogo } from './OrbiLogo';
import { Sparkles, ArrowRight, Clock, DollarSign, Bell, Mic, Check } from 'lucide-react';

interface OnboardingModalProps {
  user: UserProfile;
  onComplete: (updated: Partial<UserProfile>) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user.name || 'Carlos');
  const [goal, setGoal] = useState(user.primaryGoal || 'Equilibrar minha rotina e finanças');
  const [wakeTime, setWakeTime] = useState(user.wakeTime || '06:30');
  const [sleepTime, setSleepTime] = useState(user.sleepTime || '23:00');
  const [useFinances, setUseFinances] = useState(user.useFinances ?? true);
  const [enableNotifications, setEnableNotifications] = useState(user.enableNotifications ?? true);
  const [enableVoice, setEnableVoice] = useState(user.enableVoice ?? true);

  const handleFinish = () => {
    onComplete({
      name,
      primaryGoal: goal,
      wakeTime,
      sleepTime,
      useFinances,
      enableNotifications,
      enableVoice,
      onboardingCompleted: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6">
          <OrbiLogo size="sm" />
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-indigo-400 border border-slate-700">
            Passo {step} de 3
          </span>
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Bem-vindo ao Orbi AI
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Sua vida, seu tempo e seu dinheiro em um único centro de equilíbrio.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  1. Como podemos chamar você?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu primeiro nome"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  2. Qual seu objetivo principal?
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'Equilibrar trabalho, rotina e finanças',
                    'Não perder prazos e compromissos',
                    'Controlar gastos e contas a pagar',
                    'Melhorar foco e reduzir distrações',
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setGoal(item)}
                      className={`text-left text-xs p-3 rounded-xl border transition-all ${
                        goal === item
                          ? 'border-indigo-500 bg-indigo-950/40 text-indigo-200 font-medium'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Sua rotina básica
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                A IA usa esses horários para sugerir momentos de foco e descanso.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  Costumo acordar
                </div>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  Costumo dormir
                </div>
                <input
                  type="time"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:opacity-95 transition-opacity"
              >
                Avançar
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Preferências de recursos
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Você pode alterar todas essas escolhas nas configurações a qualquer momento.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <div
                onClick={() => setUseFinances(!useFinances)}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  useFinances
                    ? 'border-indigo-500/50 bg-indigo-950/20'
                    : 'border-slate-800 bg-slate-950/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Módulo Financeiro</div>
                    <div className="text-xs text-slate-400">Contas a pagar, despesas e relatórios</div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${useFinances ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 bg-slate-900'}`}>
                  {useFinances && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>

              <div
                onClick={() => setEnableNotifications(!enableNotifications)}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  enableNotifications
                    ? 'border-indigo-500/50 bg-indigo-950/20'
                    : 'border-slate-800 bg-slate-950/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Notificações Inteligentes</div>
                    <div className="text-xs text-slate-400">Alertas de reuniões, contas e prioridades</div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${enableNotifications ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 bg-slate-900'}`}>
                  {enableNotifications && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>

              <div
                onClick={() => setEnableVoice(!enableVoice)}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  enableVoice
                    ? 'border-indigo-500/50 bg-indigo-950/20'
                    : 'border-slate-800 bg-slate-950/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Comandos por Voz</div>
                    <div className="text-xs text-slate-400">Falar diretamente com o Orbi e ouvir respostas</div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${enableVoice ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 bg-slate-900'}`}>
                  {enableVoice && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:opacity-95 transition-opacity shadow-lg shadow-indigo-500/25"
              >
                <Sparkles className="w-4 h-4" />
                Iniciar Orbi AI
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
