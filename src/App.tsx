import React, { useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  CalendarEvent,
  TaskItem,
  BillItem,
  FinancialTransaction,
  ReminderItem,
  AlarmItem,
  AIMemoryItem,
  ChatMessage,
  ProactiveSuggestion,
  DigitalWellbeingStats,
  AIActionPayload,
} from './types';
import {
  getInitialData,
  saveUserProfile,
  saveEvents,
  saveTasks,
  saveBills,
  saveTransactions,
  saveReminders,
  saveAlarms,
  saveAIMemories,
  saveWellbeing,
  saveChatMessages,
  resetToInitialData,
} from './data/storage';
import { OrbiLogo } from './components/OrbiLogo';
import { DashboardView } from './components/DashboardView';
import { AgendaView } from './components/AgendaView';
import { TasksView } from './components/TasksView';
import { FinanceView } from './components/FinanceView';
import { OrbiAssistantView } from './components/OrbiAssistantView';
import { FocusModeModal } from './components/FocusModeModal';
import { ProfileAndSettingsModal } from './components/ProfileAndSettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { playChime, speakText } from './utils/audio';
import {
  Home,
  Calendar,
  CheckSquare,
  DollarSign,
  Sparkles,
  Bell,
  User,
  Flame,
  Menu,
} from 'lucide-react';

type TabType = 'dashboard' | 'agenda' | 'tasks' | 'finance' | 'orbi';

export default function App() {
  const initial = getInitialData();

  // App Global States
  const [user, setUser] = useState<UserProfile>(initial.user);
  const [events, setEvents] = useState<CalendarEvent[]>(initial.events);
  const [tasks, setTasks] = useState<TaskItem[]>(initial.tasks);
  const [bills, setBills] = useState<BillItem[]>(initial.bills);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(initial.transactions);
  const [reminders, setReminders] = useState<ReminderItem[]>(initial.reminders);
  const [alarms, setAlarms] = useState<AlarmItem[]>(initial.alarms);
  const [aiMemories, setAiMemories] = useState<AIMemoryItem[]>(initial.aiMemories);
  const [wellbeing, setWellbeing] = useState<DigitalWellbeingStats>(initial.wellbeing);
  const [messages, setMessages] = useState<ChatMessage[]>(initial.messages);
  const [suggestions, setSuggestions] = useState<ProactiveSuggestion[]>(initial.suggestions);

  // Active Tab Navigation
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');

  // Modals & Panels
  const [isFocusOpen, setIsFocusOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(!initial.user.onboardingCompleted);
  const [pendingConfirmation, setPendingConfirmation] = useState<AIActionPayload | null>(null);

  // Fetch live proactive suggestions from backend on mount
  useEffect(() => {
    fetch('/api/ai/proactive-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events, tasks, bills, user }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.suggestions && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
        }
      })
      .catch((err) => {
        console.warn('Using local proactive suggestions fallback', err);
      });
  }, [events.length, tasks.length, bills.length]);

  // Persist handlers
  const handleUpdateUser = (updates: Partial<UserProfile>) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    saveUserProfile(updated);
  };

  const handleCreateEvent = (newEventData: Omit<CalendarEvent, 'id' | 'userId'>) => {
    const newEvent: CalendarEvent = {
      ...newEventData,
      id: `evt-${Date.now()}`,
      userId: user.id,
    };
    const updated = [...events, newEvent];
    setEvents(updated);
    saveEvents(updated);
    playChime('success');
  };

  const handleUpdateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    const updated = events.map((e) => (e.id === id ? { ...e, ...updates } : e));
    setEvents(updated);
    saveEvents(updated);
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    saveEvents(updated);
  };

  const handleCreateTask = (newTaskData: Omit<TaskItem, 'id' | 'userId' | 'createdAt'>) => {
    const newTask: TaskItem = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveTasks(updated);
    playChime('success');
  };

  const handleUpdateTask = (id: string, updates: Partial<TaskItem>) => {
    const finalTasks = tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTasks(finalTasks);
    saveTasks(finalTasks);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    saveTasks(updated);
  };

  const handleCreateReminder = (remData: Omit<ReminderItem, 'id' | 'userId'>) => {
    const newRem: ReminderItem = {
      ...remData,
      id: `rem-${Date.now()}`,
      userId: user.id,
    };
    const updated = [...reminders, newRem];
    setReminders(updated);
    saveReminders(updated);
    playChime('success');
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    saveReminders(updated);
  };

  const handleToggleAlarm = (id: string) => {
    const updated = alarms.map((a) => (a.id === id ? { ...a, active: !a.active } : a));
    setAlarms(updated);
    saveAlarms(updated);
  };

  const handleCreateAlarm = (alarmData: Omit<AlarmItem, 'id' | 'userId'>) => {
    const newAlarm: AlarmItem = {
      ...alarmData,
      id: `alm-${Date.now()}`,
      userId: user.id,
    };
    const updated = [...alarms, newAlarm];
    setAlarms(updated);
    saveAlarms(updated);
    playChime('success');
  };

  const handleDeleteAlarm = (id: string) => {
    const updated = alarms.filter((a) => a.id !== id);
    setAlarms(updated);
    saveAlarms(updated);
  };

  const handleAddTransaction = (trxData: Omit<FinancialTransaction, 'id' | 'userId' | 'createdAt'>) => {
    const newTrx: FinancialTransaction = {
      ...trxData,
      id: `trx-${Date.now()}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTrx, ...transactions];
    setTransactions(updated);
    saveTransactions(updated);
  };

  const handleAddBill = (billData: Omit<BillItem, 'id' | 'userId'>) => {
    const newBill: BillItem = {
      ...billData,
      id: `bill-${Date.now()}`,
      userId: user.id,
    };
    const updated = [...bills, newBill];
    setBills(updated);
    saveBills(updated);
  };

  const handlePayBill = (billId: string) => {
    const targetBill = bills.find((b) => b.id === billId);
    if (!targetBill) return;

    // Mark as paid
    const updatedBills = bills.map((b) => (b.id === billId ? { ...b, status: 'paid' as const } : b));
    setBills(updatedBills);
    saveBills(updatedBills);

    // Create matching transaction
    handleAddTransaction({
      type: 'expense',
      amount: targetBill.amount,
      description: `Pagamento: ${targetBill.name}`,
      category: targetBill.category,
      date: new Date().toISOString().split('T')[0],
    });

    playChime('success');
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
  };

  const handleToggleMemory = (id: string) => {
    const updated = aiMemories.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m));
    setAiMemories(updated);
    saveAIMemories(updated);
  };

  const handleDeleteMemory = (id: string) => {
    const updated = aiMemories.filter((m) => m.id !== id);
    setAiMemories(updated);
    saveAIMemories(updated);
  };

  const handleFocusSessionComplete = (minutes: number) => {
    const nextWellbeing: DigitalWellbeingStats = {
      ...wellbeing,
      completedFocusMinutes: wellbeing.completedFocusMinutes + minutes,
      todayTotalMinutes: wellbeing.todayTotalMinutes + minutes,
    };
    setWellbeing(nextWellbeing);
    saveWellbeing(nextWellbeing);
  };

  // AI Assistant Chat & Action Execution (Prompt item 4: SUGERIR → EXPLICAR → CONFIRMAR → EXECUTAR)
  const handleSendMessage = async (userText: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-8),
          userContext: {
            user,
            events,
            tasks,
            bills,
            transactions,
            aiMemories: aiMemories.filter((m) => m.enabled),
          },
        }),
      });

      const data = await res.json();
      const replyText = data.reply || 'Entendido. Como posso ajudar mais?';

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionPayload: data.actionPayload,
        requiresConfirmation: data.requiresConfirmation,
      };

      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);
      saveChatMessages(finalMessages);

      if (data.requiresConfirmation && data.actionPayload) {
        setPendingConfirmation(data.actionPayload);
        playChime('notification');
      } else {
        playChime('success');
      }

      if (user.enableVoice) {
        speakText(replyText);
      }
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: 'Desculpe, ocorreu uma instabilidade momentânea na conexão. Por favor, tente novamente.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...updatedMessages, errorMsg]);
    }
  };

  // Human Confirmation Action
  const handleConfirmAction = (action: AIActionPayload) => {
    if (action.type === 'create_event' && action.data) {
      handleCreateEvent({
        title: action.data.title || 'Novo Compromisso',
        description: action.data.description || 'Criado via Orbi AI',
        date: action.data.date || new Date().toISOString().split('T')[0],
        time: action.data.time || '15:00',
        durationMinutes: action.data.durationMinutes || 60,
        location: action.data.location || '',
        priority: 'important',
        recurrence: 'none',
      });
    } else if (action.type === 'create_task' && action.data) {
      handleCreateTask({
        title: action.data.title || 'Nova Tarefa',
        description: action.data.description || '',
        priority: (action.data.priority as any) || 'important',
        category: action.data.category || 'Trabalho',
        dueDate: action.data.dueDate,
        status: 'pending',
      });
    } else if (action.type === 'add_expense' && action.data) {
      handleAddTransaction({
        type: 'expense',
        amount: action.data.amount || 0,
        description: action.data.description || 'Despesa registrada',
        category: action.data.category || 'Outros',
        date: new Date().toISOString().split('T')[0],
      });
    }

    setPendingConfirmation(null);
    playChime('success');

    // Add confirmation message to chat
    const confirmMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: `Ação executada com sucesso: ${action.description}. Seus registros foram sincronizados.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [...messages, confirmMsg];
    setMessages(updated);
    saveChatMessages(updated);
  };

  const handleRejectAction = () => {
    setPendingConfirmation(null);
    const cancelMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: 'Ação cancelada. Nenhum registro foi alterado.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [...messages, cancelMsg];
    setMessages(updated);
    saveChatMessages(updated);
  };

  // Quick action from dashboard
  const handleOpenQuickAction = (type: 'event' | 'task' | 'transaction' | 'reminder') => {
    if (type === 'event') setCurrentTab('agenda');
    else if (type === 'task' || type === 'reminder') setCurrentTab('tasks');
    else if (type === 'transaction') setCurrentTab('finance');
  };

  const handleOrganizeDay = () => {
    setCurrentTab('orbi');
    handleSendMessage('Por favor, organize meu dia de hoje equilibrando meus compromissos, tarefas e tempo de descanso.');
  };

  const handleExportData = () => {
    const fullBackup = {
      user,
      events,
      tasks,
      bills,
      transactions,
      reminders,
      alarms,
      aiMemories,
      wellbeing,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbi-ai-backup-${user.name.toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleResetData = () => {
    resetToInitialData();
    const fresh = getInitialData();
    setUser(fresh.user);
    setEvents(fresh.events);
    setTasks(fresh.tasks);
    setBills(fresh.bills);
    setTransactions(fresh.transactions);
    setReminders(fresh.reminders);
    setAlarms(fresh.alarms);
    setAiMemories(fresh.aiMemories);
    setWellbeing(fresh.wellbeing);
    setMessages(fresh.messages);
    setSuggestions(fresh.suggestions);
    playChime('chime');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white font-sans">
      {/* TOP APPLICATION BAR */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <div
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <OrbiLogo size="sm" />
          <div className="hidden sm:block">
            <span className="text-xs text-slate-400 font-medium tracking-wide">
              Sua vida em equilíbrio
            </span>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Plan badge */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all ${
              user.plan === 'premium'
                ? 'bg-purple-950/40 text-purple-300 border-purple-500/30 hover:border-purple-400'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            {user.plan === 'premium' ? '★ Orbi Premium' : 'Plano Grátis'}
          </button>

          {/* Quick Focus Button */}
          <button
            onClick={() => setIsFocusOpen(true)}
            title="Abrir Modo Foco"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 hover:text-amber-200 hover:border-amber-500/40 transition-colors"
          >
            <Flame className="w-4 h-4 fill-amber-300" />
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            title="Notificações Inteligentes"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Perfil & Configurações"
            className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : 'O'}
            </div>
            <span className="text-xs font-semibold text-slate-300 hidden md:inline pr-1">
              {user.name}
            </span>
          </button>
        </div>
      </header>

      {/* MAIN VIEW CONTAINER */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            user={user}
            events={events}
            tasks={tasks}
            bills={bills}
            transactions={transactions}
            suggestions={suggestions}
            wellbeing={wellbeing}
            onNavigateTab={setCurrentTab}
            onOpenFocusMode={() => setIsFocusOpen(true)}
            onOpenQuickAction={handleOpenQuickAction}
            onOrganizeDay={handleOrganizeDay}
          />
        )}

        {currentTab === 'agenda' && (
          <AgendaView
            events={events}
            onCreateEvent={handleCreateEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {currentTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            reminders={reminders}
            alarms={alarms}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onCreateReminder={handleCreateReminder}
            onDeleteReminder={handleDeleteReminder}
            onToggleAlarm={handleToggleAlarm}
            onCreateAlarm={handleCreateAlarm}
            onDeleteAlarm={handleDeleteAlarm}
          />
        )}

        {currentTab === 'finance' && (
          <FinanceView
            transactions={transactions}
            bills={bills}
            onAddTransaction={handleAddTransaction}
            onAddBill={handleAddBill}
            onPayBill={handlePayBill}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {currentTab === 'orbi' && (
          <OrbiAssistantView
            messages={messages}
            pendingConfirmation={pendingConfirmation}
            onSendMessage={handleSendMessage}
            onConfirmAction={handleConfirmAction}
            onRejectAction={handleRejectAction}
            voiceEnabled={user.enableVoice}
          />
        )}
      </main>

      {/* BOTTOM NAVIGATION BAR (Mobile First - Specifications 6 & 7) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 sm:py-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {/* Dashboard */}
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              currentTab === 'dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Início</span>
          </button>

          {/* Agenda */}
          <button
            onClick={() => setCurrentTab('agenda')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              currentTab === 'agenda' ? 'text-sky-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Agenda</span>
          </button>

          {/* Central ORBI Assistant Button with Glowing Orbit */}
          <button
            onClick={() => setCurrentTab('orbi')}
            className="flex flex-col items-center justify-center relative -top-3 group"
          >
            <div
              className={`w-13 h-13 rounded-full flex items-center justify-center shadow-xl transition-transform group-hover:scale-105 ${
                currentTab === 'orbi'
                  ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-400 shadow-indigo-500/40 ring-4 ring-indigo-500/20'
                  : 'bg-gradient-to-br from-indigo-600 to-purple-700 shadow-indigo-900/50'
              }`}
            >
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <span
              className={`text-[10px] mt-0.5 font-bold ${
                currentTab === 'orbi' ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300' : 'text-slate-400'
              }`}
            >
              Orbi AI
            </span>
          </button>

          {/* Tasks */}
          <button
            onClick={() => setCurrentTab('tasks')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              currentTab === 'tasks' ? 'text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Tarefas</span>
          </button>

          {/* Finance */}
          <button
            onClick={() => setCurrentTab('finance')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              currentTab === 'finance' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Finanças</span>
          </button>
        </div>
      </nav>

      {/* MODALS */}
      {/* Onboarding Modal */}
      {isOnboardingOpen && (
        <OnboardingModal
          user={user}
          onComplete={(updated) => {
            handleUpdateUser(updated);
            setIsOnboardingOpen(false);
          }}
        />
      )}

      {/* Focus Mode Timer Modal */}
      <FocusModeModal
        isOpen={isFocusOpen}
        onClose={() => setIsFocusOpen(false)}
        onSessionComplete={handleFocusSessionComplete}
      />

      {/* Profile & Settings Modal */}
      <ProfileAndSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        aiMemories={aiMemories}
        onUpdateUser={handleUpdateUser}
        onToggleMemory={handleToggleMemory}
        onDeleteMemory={handleDeleteMemory}
        onExportData={handleExportData}
        onResetData={handleResetData}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        events={events}
        bills={bills}
        tasks={tasks}
        onNavigateTab={setCurrentTab}
      />
    </div>
  );
}
