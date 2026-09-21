import React from 'react';
import { X, Bell, Calendar, DollarSign, CheckSquare, Sparkles, ArrowRight } from 'lucide-react';
import { CalendarEvent, BillItem, TaskItem } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEvent[];
  bills: BillItem[];
  tasks: TaskItem[];
  onNavigateTab: (tab: 'dashboard' | 'agenda' | 'tasks' | 'finance' | 'orbi') => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  events,
  bills,
  tasks,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  // Build smart notifications
  const upcomingBills = bills.filter((b) => b.status === 'upcoming' || b.status === 'overdue');
  const urgentTasks = tasks.filter((t) => t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'important'));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm h-full bg-slate-900 border-l border-slate-800 p-5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Notificações Inteligentes</h3>
              <p className="text-[11px] text-slate-400">Filtradas por relevância do Orbi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Feed */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {/* Agenda notification */}
          {events.length > 0 && (
            <div
              onClick={() => {
                onNavigateTab('agenda');
                onClose();
              }}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Agenda Próxima</span>
              </div>
              <p className="text-xs font-medium text-slate-200 group-hover:text-white">
                "{events[0].title}" às {events[0].time}.
              </p>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Duração: {events[0].durationMinutes} min</span>
                <span className="text-indigo-400 flex items-center gap-1 group-hover:underline">
                  Ver agenda <ArrowRight className="w-3 h-3" />
                </span>
              </p>
            </div>
          )}

          {/* Bill notification */}
          {upcomingBills.length > 0 && (
            <div
              onClick={() => {
                onNavigateTab('finance');
                onClose();
              }}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Vencimento Próximo</span>
              </div>
              <p className="text-xs font-medium text-slate-200 group-hover:text-white">
                A conta "{upcomingBills[0].name}" de R$ {upcomingBills[0].amount.toFixed(2)} vence em breve.
              </p>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Vencimento: {upcomingBills[0].dueDate}</span>
                <span className="text-amber-400 flex items-center gap-1 group-hover:underline">
                  Acessar <ArrowRight className="w-3 h-3" />
                </span>
              </p>
            </div>
          )}

          {/* Tasks notification */}
          {urgentTasks.length > 0 && (
            <div
              onClick={() => {
                onNavigateTab('tasks');
                onClose();
              }}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-1">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Tarefas Críticas</span>
              </div>
              <p className="text-xs font-medium text-slate-200 group-hover:text-white">
                Você ainda possui {urgentTasks.length} tarefa(s) importantes pendentes para hoje.
              </p>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Ex: {urgentTasks[0].title}</span>
                <span className="text-rose-400 flex items-center gap-1 group-hover:underline">
                  Ver tarefas <ArrowRight className="w-3 h-3" />
                </span>
              </p>
            </div>
          )}

          {/* AI active prompt */}
          <div
            onClick={() => {
              onNavigateTab('orbi');
              onClose();
            }}
            className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/30 hover:border-indigo-400/60 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Orbi Sugestão Ativa</span>
            </div>
            <p className="text-xs font-medium text-slate-200">
              "Posso reorganizar o restante do seu dia e distribuir as tarefas nos seus horários livres?"
            </p>
            <div className="mt-2 text-right">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                Conversar com Orbi <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 text-center">
          O Orbi prioriza alertas relevantes para evitar sobrecarga sensorial.
        </div>
      </div>
    </div>
  );
};
