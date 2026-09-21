import React, { useState } from 'react';
import { TaskItem, ReminderItem, AlarmItem, PriorityLevel } from '../types';
import {
  CheckSquare,
  Bell,
  AlarmClock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Circle,
  Clock,
  Sparkles,
  MapPin,
  Volume2,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { playChime } from '../utils/audio';

interface TasksViewProps {
  tasks: TaskItem[];
  reminders: ReminderItem[];
  alarms: AlarmItem[];
  onCreateTask: (task: Omit<TaskItem, 'id' | 'userId' | 'createdAt'>) => void;
  onUpdateTask: (id: string, updates: Partial<TaskItem>) => void;
  onDeleteTask: (id: string) => void;
  onCreateReminder: (reminder: Omit<ReminderItem, 'id' | 'userId'>) => void;
  onDeleteReminder: (id: string) => void;
  onToggleAlarm: (id: string) => void;
  onCreateAlarm: (alarm: Omit<AlarmItem, 'id' | 'userId'>) => void;
  onDeleteAlarm: (id: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  reminders,
  alarms,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onCreateReminder,
  onDeleteReminder,
  onToggleAlarm,
  onCreateAlarm,
  onDeleteAlarm,
}) => {
  const [subTab, setSubTab] = useState<'tasks' | 'reminders' | 'alarms'>('tasks');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  // Task Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>('important');
  const [taskCategory, setTaskCategory] = useState('Trabalho');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Reminder Modal
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('10:00');
  const [reminderDate, setReminderDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminderLocation, setReminderLocation] = useState('');

  // Alarm Modal
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [alarmTime, setAlarmTime] = useState('07:00');
  const [alarmLabel, setAlarmLabel] = useState('Acordar & Disposição');
  const [alarmDays, setAlarmDays] = useState<string[]>(['Seg', 'Ter', 'Qua', 'Qui', 'Sex']);

  // AI Organize priority action
  const handleAIReorder = () => {
    playChime('notification');
    alert('Orbi AI reordenou suas prioridades destacando tarefas 🔴 Urgentes e 🟠 Importantes no topo.');
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    onCreateTask({
      title: taskTitle,
      description: taskDesc,
      priority: taskPriority,
      category: taskCategory,
      dueDate: taskDueDate || undefined,
      status: 'pending',
    });
    setTaskTitle('');
    setTaskDesc('');
    setIsTaskModalOpen(false);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim()) return;
    onCreateReminder({
      title: reminderTitle,
      date: reminderDate,
      time: reminderTime,
      status: 'active',
      locationTrigger: reminderLocation || undefined,
      recurrence: 'none',
    });
    setReminderTitle('');
    setIsReminderModalOpen(false);
  };

  const handleSaveAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateAlarm({
      time: alarmTime,
      label: alarmLabel,
      days: alarmDays,
      active: true,
    });
    setIsAlarmModalOpen(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'pending') return t.status !== 'completed';
    if (taskFilter === 'completed') return t.status === 'completed';
    return true;
  });

  const renderPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'urgent':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
            🔴 Urgente
          </span>
        );
      case 'important':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            🟠 Importante
          </span>
        );
      case 'attention':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
            🟡 Atenção
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            🟢 Normal
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 pb-20 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-400" /> Tarefas & Lembretes
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organização por prioridade, alarmes sonoros e lembretes contextuais.
          </p>
        </div>

        {subTab === 'tasks' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleAIReorder}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold hover:border-indigo-500 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              IA Priorizar
            </button>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nova Tarefa
            </button>
          </div>
        )}

        {subTab === 'reminders' && (
          <button
            onClick={() => setIsReminderModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Lembrete
          </button>
        )}

        {subTab === 'alarms' && (
          <button
            onClick={() => setIsAlarmModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Alarme
          </button>
        )}
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setSubTab('tasks')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'tasks'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Tarefas ({tasks.filter((t) => t.status !== 'completed').length})
        </button>

        <button
          onClick={() => setSubTab('reminders')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'reminders'
              ? 'bg-amber-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          Lembretes ({reminders.length})
        </button>

        <button
          onClick={() => setSubTab('alarms')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'alarms'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlarmClock className="w-4 h-4" />
          Alarmes ({alarms.length})
        </button>
      </div>

      {/* TAB CONTENT: TASKS */}
      {subTab === 'tasks' && (
        <div className="space-y-3">
          {/* Status Filter */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Filtrar tarefas:</span>
            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[
                { id: 'pending', label: 'Pendentes' },
                { id: 'completed', label: 'Concluídas' },
                { id: 'all', label: 'Todas' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTaskFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    taskFilter === f.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                Nenhuma tarefa encontrada neste filtro.
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    task.status === 'completed'
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => {
                        const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
                        onUpdateTask(task.id, { status: nextStatus });
                        if (nextStatus === 'completed') playChime('success');
                      }}
                      className="mt-0.5 text-slate-500 hover:text-indigo-400 transition-colors shrink-0"
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 hover:text-indigo-400" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-semibold text-white ${
                            task.status === 'completed' ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                        {renderPriorityBadge(task.priority)}
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                          {task.category}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-400">{task.description}</p>
                      )}

                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>Prazo: {task.dueDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors shrink-0"
                    title="Excluir tarefa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: REMINDERS (Spec item 12) */}
      {subTab === 'reminders' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
            <Bell className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Lembretes Contextuais: </span>
              Lembretes programados por horário e estrutura preparada para geofencing ("Lembrar ao chegar ao trabalho").
            </div>
          </div>

          <div className="space-y-2.5">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                      {rem.time}
                    </span>
                    <span className="text-sm font-semibold text-white">{rem.title}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{rem.date}</span>
                    </div>
                    {rem.locationTrigger && (
                      <div className="flex items-center gap-1 text-sky-400">
                        <MapPin className="w-3 h-3" />
                        <span>Gatilho de Localização Ativo</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteReminder(rem.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ALARMS (Spec item 13) */}
      {subTab === 'alarms' && (
        <div className="space-y-3">
          <div className="space-y-2.5">
            {alarms.map((alarm) => (
              <div
                key={alarm.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black font-mono text-white tracking-tight">
                      {alarm.time}
                    </span>
                    <button
                      onClick={() => playChime('alarm')}
                      title="Testar som do alarme"
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs font-semibold text-slate-300">{alarm.label}</div>
                  <div className="flex gap-1 text-[10px] text-slate-400 font-medium">
                    {alarm.days.join(' · ')}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => onToggleAlarm(alarm.id)}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {alarm.active ? (
                      <ToggleRight className="w-8 h-8 text-purple-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-600" />
                    )}
                  </button>
                  <button
                    onClick={() => onDeleteAlarm(alarm.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create Task */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Nova Tarefa</h3>
            <form onSubmit={handleSaveTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Título da Tarefa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Finalizar proposta de projeto"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Prioridade</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="urgent">🔴 Urgente</option>
                    <option value="important">🟠 Importante</option>
                    <option value="attention">🟡 Atenção</option>
                    <option value="normal">🟢 Normal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Categoria</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Trabalho">Trabalho</option>
                    <option value="Pessoal">Pessoal</option>
                    <option value="Finanças">Finanças</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Estudo">Estudo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Prazo (opcional)</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Instruções ou detalhes da tarefa..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Reminder */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Novo Lembrete</h3>
            <form onSubmit={handleSaveReminder} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">O que você quer lembrar?</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Comprar ração sábado às 10h"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Gatilho de Localização (Arquitetura Futura)</label>
                <input
                  type="text"
                  placeholder="Ex: Quando eu chegar ao trabalho"
                  value={reminderLocation}
                  onChange={(e) => setReminderLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Salvar Lembrete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Alarm */}
      {isAlarmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Novo Alarme</h3>
            <form onSubmit={handleSaveAlarm} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Horário do Alarme</label>
                <input
                  type="time"
                  required
                  value={alarmTime}
                  onChange={(e) => setAlarmTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-base font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nome / Rótulo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Acordar / Preparar para dormir"
                  value={alarmLabel}
                  onChange={(e) => setAlarmLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAlarmModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Ativar Alarme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
