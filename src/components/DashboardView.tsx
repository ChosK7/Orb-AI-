import React from 'react';
import {
  UserProfile,
  CalendarEvent,
  TaskItem,
  BillItem,
  FinancialTransaction,
  ProactiveSuggestion,
  DigitalWellbeingStats,
  PriorityLevel,
} from '../types';
import {
  Sparkles,
  Calendar,
  CheckSquare,
  DollarSign,
  Clock,
  ArrowRight,
  Plus,
  AlertTriangle,
  Flame,
  Zap,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface DashboardViewProps {
  user: UserProfile;
  events: CalendarEvent[];
  tasks: TaskItem[];
  bills: BillItem[];
  transactions: FinancialTransaction[];
  suggestions: ProactiveSuggestion[];
  wellbeing: DigitalWellbeingStats;
  onNavigateTab: (tab: 'dashboard' | 'agenda' | 'tasks' | 'finance' | 'orbi') => void;
  onOpenFocusMode: () => void;
  onOpenQuickAction: (action: 'event' | 'task' | 'transaction' | 'reminder') => void;
  onOrganizeDay: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  events,
  tasks,
  bills,
  transactions,
  suggestions,
  wellbeing,
  onNavigateTab,
  onOpenFocusMode,
  onOpenQuickAction,
  onOrganizeDay,
}) => {
  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Priority badge styling
  const renderPriorityBadge = (p?: PriorityLevel) => {
    switch (p) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Urgente
          </span>
        );
      case 'important':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Importante
          </span>
        );
      case 'attention':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Atenção
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Normal
          </span>
        );
    }
  };

  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const upcomingBills = bills.filter((b) => b.status === 'upcoming' || b.status === 'overdue');
  const todayEvents = events.slice(0, 3);

  // Financial calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* 1. Header Greeting & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-sky-400">{user.name}</span>.
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Seu resumo inteligente e equilibrado para hoje.
          </p>
        </div>

        {/* Quick Focus Button */}
        <button
          onClick={onOpenFocusMode}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600/90 to-purple-600/90 hover:from-indigo-600 hover:to-purple-600 text-white text-xs font-bold border border-indigo-500/30 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
          Modo Foco (Timer)
        </button>
      </div>

      {/* 2. SECTION: Orbi Sugere (Inteligência Ativa - Prompt item 4, 5, 7) */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/30 p-5 shadow-xl shadow-indigo-950/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Orbi Sugere</span>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Inteligência Proativa
          </span>
        </div>

        {/* Contextual intelligent highlight */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-indigo-500/20 mb-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-100 leading-snug">
                {events.length > 0 && events[0].location
                  ? `Você tem "${events[0].title}" às ${events[0].time}. Considerando deslocamento para ${events[0].location}, sugerimos sair às 14:20.`
                  : `Você possui ${pendingTasks.length} tarefas pendentes e ${upcomingBills.length} conta vencendo em breve. Deseja organizar sua tarde?`}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Princípio Orbi: Sugerir → Explicar → Confirmar → Executar.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Proactive Suggestions Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {suggestions.slice(0, 2).map((sug) => (
            <div
              key={sug.id}
              onClick={() => onNavigateTab(sug.actionTab as any)}
              className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  {renderPriorityBadge(sug.priority)}
                  <span className="text-[11px] font-semibold text-slate-300">{sug.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{sug.description}</p>
              </div>
              <span className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1 shrink-0">
                {sug.actionLabel}
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Ações Rápidas (Prompt item 7) */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={onOrganizeDay}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition-all cursor-pointer group text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-200">Organizar meu dia</span>
          </button>

          <button
            onClick={() => onNavigateTab('agenda')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition-all cursor-pointer group text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-200">Ver agenda</span>
          </button>

          <button
            onClick={() => onNavigateTab('finance')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition-all cursor-pointer group text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-200">Ver contas</span>
          </button>

          <button
            onClick={() => onOpenQuickAction('transaction')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition-all cursor-pointer group text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-200">Registrar gasto</span>
          </button>

          <button
            onClick={() => onOpenQuickAction('reminder')}
            className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition-all cursor-pointer group text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-200">Criar lembrete</span>
          </button>
        </div>
      </div>

      {/* 4. Resumo do Dia (Compromissos, Tarefas, Finanças, Bem-estar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Próximos Compromissos */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Próximos Compromissos
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('agenda')}
                className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
              >
                Abrir <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {todayEvents.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">Nenhum compromisso marcado para hoje.</p>
            ) : (
              <div className="space-y-2.5">
                {todayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-sky-400">{evt.time}</span>
                        <span className="text-xs font-semibold text-white">{evt.title}</span>
                      </div>
                      {evt.location && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{evt.location}</span>
                        </div>
                      )}
                    </div>
                    {renderPriorityBadge(evt.priority)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tarefas Críticas */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Tarefas Prioritárias ({pendingTasks.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('tasks')}
                className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
              >
                Ver todas <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Tudo concluído! Nenhuma tarefa pendente.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      <span className="text-xs text-slate-200 font-medium truncate">
                        {task.title}
                      </span>
                    </div>
                    {renderPriorityBadge(task.priority)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resumo Financeiro & Contas a Pagar */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Finanças & Contas
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('finance')}
              className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
            >
              Extrato <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Saldo Estimado</span>
              <span className="text-base font-extrabold font-mono text-emerald-400">
                R$ {currentBalance.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Contas Pendentes</span>
              <span className="text-base font-extrabold font-mono text-amber-400">
                {upcomingBills.length} a pagar
              </span>
            </div>
          </div>

          {upcomingBills.length > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
              <span>Vencendo: {upcomingBills[0].name} (R$ {upcomingBills[0].amount.toFixed(2)})</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-200">
                {upcomingBills[0].dueDate}
              </span>
            </div>
          )}
        </div>

        {/* Bem-estar Digital & Tempo de Uso (Prompt item 18) */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Bem-Estar Digital
              </h3>
            </div>
            <span className="text-[11px] text-purple-400 font-semibold">
              Meta: {wellbeing.completedFocusMinutes}/{wellbeing.focusGoalMinutes}m foco
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Tempo Total em Equilíbrio Hoje:</span>
              <span className="font-mono font-bold text-white">{wellbeing.todayTotalMinutes} minutos</span>
            </div>

            {/* Visual Breakdown by category */}
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden flex">
              <div style={{ width: '30%' }} className="bg-sky-500" title="Agenda (30%)" />
              <div style={{ width: '35%' }} className="bg-indigo-500" title="Tarefas (35%)" />
              <div style={{ width: '20%' }} className="bg-emerald-500" title="Finanças (20%)" />
              <div style={{ width: '15%' }} className="bg-purple-500" title="Orbi IA (15%)" />
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 pt-1">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Agenda</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Tarefas</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Finanças</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> IA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
