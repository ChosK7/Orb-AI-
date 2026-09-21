import React, { useState } from 'react';
import { UserProfile, AIMemoryItem } from '../types';
import {
  X,
  User,
  Brain,
  Sparkles,
  Shield,
  CreditCard,
  Download,
  Trash2,
  Check,
  ToggleLeft,
  ToggleRight,
  Clock,
  Volume2,
  Lock,
} from 'lucide-react';

interface ProfileAndSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  aiMemories: AIMemoryItem[];
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onToggleMemory: (id: string) => void;
  onDeleteMemory: (id: string) => void;
  onExportData: () => void;
  onResetData: () => void;
}

export const ProfileAndSettingsModal: React.FC<ProfileAndSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  aiMemories,
  onUpdateUser,
  onToggleMemory,
  onDeleteMemory,
  onExportData,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'memory' | 'plan' | 'security'>('profile');
  const [name, setName] = useState(user.name);
  const [goal, setGoal] = useState(user.primaryGoal);
  const [wakeTime, setWakeTime] = useState(user.wakeTime);
  const [sleepTime, setSleepTime] = useState(user.sleepTime);
  const [workStartTime, setWorkStartTime] = useState(user.workStartTime);
  const [priceConfig, setPriceConfig] = useState(user.monthlyPrice || 24.9);
  const [savedToast, setSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    onUpdateUser({
      name,
      primaryGoal: goal,
      wakeTime,
      sleepTime,
      workStartTime,
      monthlyPrice: priceConfig,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleUpgradePlan = () => {
    const nextPlan = user.plan === 'free' ? 'premium' : 'free';
    onUpdateUser({ plan: nextPlan });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-base">
              {user.name ? user.name.charAt(0).toUpperCase() : 'O'}
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Configurações & Perfil</h2>
              <p className="text-xs text-slate-400">Orbi AI v1.0.0 — Gestão do Usuário</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 shrink-0 overflow-x-auto">
          {[
            { id: 'profile', label: 'Meu Perfil', icon: User },
            { id: 'memory', label: 'Memória da IA', icon: Brain },
            { id: 'plan', label: 'Plano & Preço', icon: CreditCard },
            { id: 'security', label: 'Privacidade & Dados', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {savedToast && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              Preferências atualizadas com sucesso!
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nome Completo / Como chamar
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Objetivo Principal com o Orbi
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">Acordar</span>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">Início do Trabalho</span>
                  <input
                    type="time"
                    value={workStartTime}
                    onChange={(e) => setWorkStartTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">Dormir</span>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {/* TAB: AI MEMORY (Specification 22) */}
          {activeTab === 'memory' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5">
                <Brain className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Transparência Total de Memória: </span>
                  O Orbi aprende apenas com hábitos explicitamente permitidos por você. Você tem o controle de ativar, pausar ou apagar qualquer fato contextual.
                </div>
              </div>

              <div className="space-y-2">
                {aiMemories.map((mem) => (
                  <div
                    key={mem.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {mem.category}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Aprendido em {mem.dateLearned}
                        </span>
                      </div>
                      <p className={`text-xs ${mem.enabled ? 'text-slate-200' : 'text-slate-500 line-through'}`}>
                        {mem.fact}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onToggleMemory(mem.id)}
                        className="text-slate-400 hover:text-indigo-400 transition-colors"
                        title={mem.enabled ? 'Pausar aprendizado deste item' : 'Reativar item'}
                      >
                        {mem.enabled ? (
                          <ToggleRight className="w-6 h-6 text-indigo-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-slate-600" />
                        )}
                      </button>
                      <button
                        onClick={() => onDeleteMemory(mem.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Esquecer este fato"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PLAN & MONETIZATION (Specification 31) */}
          {activeTab === 'plan' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Free Plan */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    user.plan === 'free'
                      ? 'border-indigo-500 bg-indigo-950/20'
                      : 'border-slate-800 bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-slate-400">Plano Gratuito</span>
                    {user.plan === 'free' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Ativo
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-extrabold text-white mb-2">R$ 0,00</div>
                  <ul className="text-xs text-slate-400 space-y-1.5 mb-4">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Agenda e calendário integrados</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Tarefas, lembretes e alarmes</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Controle financeiro essencial</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Interações diárias com Orbi IA</li>
                  </ul>
                  {user.plan !== 'free' && (
                    <button
                      onClick={handleUpgradePlan}
                      className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                    >
                      Mudar para Grátis
                    </button>
                  )}
                </div>

                {/* Premium Plan */}
                <div
                  className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                    user.plan === 'premium'
                      ? 'border-purple-500 bg-purple-950/20'
                      : 'border-indigo-500/50 bg-slate-950'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-purple-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Orbi Premium
                    </span>
                    {user.plan === 'premium' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Seu Plano Atual
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-extrabold text-white mb-1">
                    R$ {priceConfig.toFixed(2).replace('.', ',')}{' '}
                    <span className="text-xs font-normal text-slate-400">/mês</span>
                  </div>
                  <p className="text-[10px] text-indigo-300 mb-3">Preço inicial de teste configurável (R$ 19,90 a R$ 29,90)</p>
                  <ul className="text-xs text-slate-300 space-y-1.5 mb-4">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-400" /> IA proativa contínua sem limites</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-400" /> Comandos de voz avançados & TTS</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-400" /> Relatórios de bem-estar e finanças</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-400" /> Acesso prioritário a Open Finance</li>
                  </ul>
                  <button
                    onClick={handleUpgradePlan}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold hover:opacity-95 shadow-lg shadow-purple-500/25 transition-opacity"
                  >
                    {user.plan === 'premium' ? 'Plano Ativo (Cancelar)' : 'Simular Assinatura Premium'}
                  </button>
                </div>
              </div>

              {/* Price configuration slider for product test (Spec 31) */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">
                    Configurador de Preço de Teste (Regra de Negócio):
                  </span>
                  <span className="font-mono text-xs font-bold text-indigo-400">
                    R$ {priceConfig.toFixed(2)}/mês
                  </span>
                </div>
                <input
                  type="range"
                  min="19.90"
                  max="29.90"
                  step="1.00"
                  value={priceConfig}
                  onChange={(e) => setPriceConfig(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>R$ 19,90</span>
                  <span>R$ 24,90 (Recomendado)</span>
                  <span>R$ 29,90</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SECURITY & DATA PRIVACY (Spec 23 & 45) */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Lock className="w-4 h-4" /> Isolamento Estrito de Dados
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Todas as tarefas, eventos e registros financeiros possuem chave única atribuída ao seu usuário (<code className="text-indigo-300 font-mono">{user.id}</code>). As chaves de IA nunca são expostas ao cliente web, trafegando exclusivamente pelo backend.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={onExportData}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
                >
                  <Download className="w-4 h-4 text-indigo-400" />
                  Exportar Backup Completo (JSON)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Tem certeza de que deseja resetar os dados locais para os padrões de demonstração?')) {
                      onResetData();
                      onClose();
                    }
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-rose-900/40 bg-rose-950/20 text-rose-300 text-xs font-semibold hover:bg-rose-900/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Redefinir Dados Locais
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
