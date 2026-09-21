import {
  UserProfile,
  TaskItem,
  CalendarEvent,
  ReminderItem,
  AlarmItem,
  FinancialTransaction,
  BillItem,
  AIMemoryItem,
  DigitalWellbeingStats,
  ChatMessage,
  ProactiveSuggestion,
} from '../types';

const STORAGE_PREFIX = 'orbi_ai_v1_';

export const INITIAL_USER: UserProfile = {
  id: 'usr_carlos_01',
  name: 'Carlos',
  email: 'carlos@orbi.ai',
  primaryGoal: 'Equilibrar trabalho, rotina pessoal e finanças',
  wakeTime: '06:00',
  sleepTime: '22:30',
  workStartTime: '08:00',
  useFinances: true,
  enableNotifications: true,
  enableVoice: true,
  plan: 'free',
  monthlyPrice: 24.9,
  onboardingCompleted: true,
  createdAt: new Date().toISOString(),
};

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'evt_1',
    userId: 'usr_carlos_01',
    title: 'Reunião de Alinhamento com Diretoria',
    description: 'Apresentação dos resultados e próximos marcos estratégicos',
    date: new Date().toISOString().split('T')[0],
    time: '15:00',
    durationMinutes: 60,
    location: 'Av. Paulista, 1200 - São Paulo',
    recurrence: 'none',
    reminderMinutes: 30,
    priority: 'urgent',
  },
  {
    id: 'evt_2',
    userId: 'usr_carlos_01',
    title: 'Consulta Médica de Rotina',
    description: 'Exames semestrais e check-up geral',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '14:00',
    durationMinutes: 45,
    location: 'Centro Clínico Jardins',
    recurrence: 'none',
    reminderMinutes: 60,
    priority: 'important',
  },
  {
    id: 'evt_3',
    userId: 'usr_carlos_01',
    title: 'Sessão de Planejamento Semanal',
    description: 'Revisão das metas e priorização das pendências',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    durationMinutes: 30,
    location: 'Escritório / Remoto',
    recurrence: 'weekly',
    reminderMinutes: 15,
    priority: 'important',
  },
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'tsk_1',
    userId: 'usr_carlos_01',
    title: 'Finalizar proposta de projeto comercial',
    description: 'Estruturar o orçamento e cronograma de entregas',
    priority: 'urgent',
    dueDate: new Date().toISOString().split('T')[0],
    category: 'Trabalho',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tsk_2',
    userId: 'usr_carlos_01',
    title: 'Revisar fluxo de caixa e conciliação',
    description: 'Checar faturas pendentes e conferir extrato',
    priority: 'important',
    dueDate: new Date().toISOString().split('T')[0],
    category: 'Finanças',
    status: 'in_progress',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tsk_3',
    userId: 'usr_carlos_01',
    title: 'Comprar ração para os pets',
    description: 'Pacote de 15kg no petshop do bairro',
    priority: 'attention',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    category: 'Pessoal',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tsk_4',
    userId: 'usr_carlos_01',
    title: 'Organizar pasta de documentos fiscais',
    description: 'Arquivar comprovantes do trimestre',
    priority: 'normal',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    category: 'Organização',
    status: 'completed',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_BILLS: BillItem[] = [
  {
    id: 'bil_1',
    userId: 'usr_carlos_01',
    name: 'Internet Fibra 600MB',
    amount: 99.9,
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    category: 'Contas',
    recurrence: 'monthly',
    status: 'upcoming',
  },
  {
    id: 'bil_2',
    userId: 'usr_carlos_01',
    name: 'Conta de Energia Elétrica',
    amount: 174.5,
    dueDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
    category: 'Moradia',
    recurrence: 'monthly',
    status: 'upcoming',
  },
  {
    id: 'bil_3',
    userId: 'usr_carlos_01',
    name: 'Plano de Saúde',
    amount: 420.0,
    dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    category: 'Saúde',
    recurrence: 'monthly',
    status: 'paid',
  },
];

export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'trx_1',
    userId: 'usr_carlos_01',
    type: 'income',
    amount: 5400.0,
    category: 'Trabalho',
    description: 'Recebimento de honorários mensais',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'trx_2',
    userId: 'usr_carlos_01',
    type: 'expense',
    amount: 35.0,
    category: 'Alimentação',
    description: 'Almoço restaurante executivo',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'trx_3',
    userId: 'usr_carlos_01',
    type: 'expense',
    amount: 180.5,
    category: 'Transporte',
    description: 'Abastecimento veículo e combustível',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'trx_4',
    userId: 'usr_carlos_01',
    type: 'expense',
    amount: 89.9,
    category: 'Alimentação',
    description: 'Compras de mercado matinal',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_ALARMS: AlarmItem[] = [
  {
    id: 'alm_1',
    userId: 'usr_carlos_01',
    time: '06:00',
    label: 'Acordar & Respiração',
    days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
    active: true,
  },
  {
    id: 'alm_2',
    userId: 'usr_carlos_01',
    time: '07:30',
    label: 'Sair para o trabalho / Deslocamento',
    days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
    active: true,
  },
  {
    id: 'alm_3',
    userId: 'usr_carlos_01',
    time: '22:30',
    label: 'Preparar para dormir & Relaxamento',
    days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    active: true,
  },
];

export const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'rem_1',
    userId: 'usr_carlos_01',
    title: 'Comprar ração para pets sábado às 10h',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '10:00',
    recurrence: 'none',
    status: 'active',
  },
  {
    id: 'rem_2',
    userId: 'usr_carlos_01',
    title: 'Tomar vitamina D e beber água',
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    recurrence: 'daily',
    status: 'active',
  },
  {
    id: 'rem_3',
    userId: 'usr_carlos_01',
    title: 'Lembrar quando chegar ao escritório (Geofence)',
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    recurrence: 'none',
    status: 'active',
    locationTrigger: 'Escritório Central (Lat: -23.561, Lng: -46.656)',
  },
];

export const INITIAL_AI_MEMORY: AIMemoryItem[] = [
  {
    id: 'mem_1',
    category: 'Rotina',
    fact: 'Costuma acordar às 06:00 em dias úteis',
    dateLearned: '2026-09-10',
    enabled: true,
  },
  {
    id: 'mem_2',
    category: 'Trabalho',
    fact: 'Inicia expediente profissional por volta das 08:00',
    dateLearned: '2026-09-11',
    enabled: true,
  },
  {
    id: 'mem_3',
    category: 'Produtividade',
    fact: 'Prefere blocos de foco de 45 minutos no início da manhã',
    dateLearned: '2026-09-12',
    enabled: true,
  },
  {
    id: 'mem_4',
    category: 'Hábitos',
    fact: 'Realiza pausas para refeição entre 12:00 e 13:00',
    dateLearned: '2026-09-14',
    enabled: true,
  },
];

export const INITIAL_WELLBEING: DigitalWellbeingStats = {
  todayTotalMinutes: 84,
  categoryMinutes: {
    agenda: 18,
    tasks: 26,
    finances: 15,
    orbi: 15,
    focus: 10,
  },
  focusGoalMinutes: 90,
  completedFocusMinutes: 45,
};

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome',
    sender: 'assistant',
    text: 'Olá, Carlos! Sou o Orbi AI. Estou conectado à sua agenda, tarefas, alarmes e contas financeiras. Como posso ajudar a equilibrar o seu dia hoje?',
    timestamp: '08:00',
  },
];

export const INITIAL_SUGGESTIONS: ProactiveSuggestion[] = [
  {
    id: 'sug_1',
    category: 'agenda',
    title: 'Deslocamento Reunião 15h',
    description: 'Você tem reunião às 15h na Av. Paulista. Sugerimos sair às 14:20.',
    priority: 'important',
    actionLabel: 'Ver trajeto',
    actionTab: 'agenda',
  },
  {
    id: 'sug_2',
    category: 'finance',
    title: 'Conta de Internet Vencendo',
    description: 'Fatura de R$ 99,90 vence amanhã. Confirmar pagamento?',
    priority: 'urgent',
    actionLabel: 'Pagar conta',
    actionTab: 'finance',
  },
];

// Safe storage utilities
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error loading ${key} from storage:`, e);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error saving ${key} to storage:`, e);
  }
}

export function getInitialData() {
  return {
    user: loadFromStorage<UserProfile>('user', INITIAL_USER),
    events: loadFromStorage<CalendarEvent[]>('events', INITIAL_EVENTS),
    tasks: loadFromStorage<TaskItem[]>('tasks', INITIAL_TASKS),
    bills: loadFromStorage<BillItem[]>('bills', INITIAL_BILLS),
    transactions: loadFromStorage<FinancialTransaction[]>('transactions', INITIAL_TRANSACTIONS),
    reminders: loadFromStorage<ReminderItem[]>('reminders', INITIAL_REMINDERS),
    alarms: loadFromStorage<AlarmItem[]>('alarms', INITIAL_ALARMS),
    aiMemories: loadFromStorage<AIMemoryItem[]>('memories', INITIAL_AI_MEMORY),
    wellbeing: loadFromStorage<DigitalWellbeingStats>('wellbeing', INITIAL_WELLBEING),
    messages: loadFromStorage<ChatMessage[]>('messages', INITIAL_MESSAGES),
    suggestions: loadFromStorage<ProactiveSuggestion[]>('suggestions', INITIAL_SUGGESTIONS),
  };
}

export const saveUserProfile = (data: UserProfile) => saveToStorage('user', data);
export const saveEvents = (data: CalendarEvent[]) => saveToStorage('events', data);
export const saveTasks = (data: TaskItem[]) => saveToStorage('tasks', data);
export const saveBills = (data: BillItem[]) => saveToStorage('bills', data);
export const saveTransactions = (data: FinancialTransaction[]) => saveToStorage('transactions', data);
export const saveReminders = (data: ReminderItem[]) => saveToStorage('reminders', data);
export const saveAlarms = (data: AlarmItem[]) => saveToStorage('alarms', data);
export const saveAIMemories = (data: AIMemoryItem[]) => saveToStorage('memories', data);
export const saveWellbeing = (data: DigitalWellbeingStats) => saveToStorage('wellbeing', data);
export const saveChatMessages = (data: ChatMessage[]) => saveToStorage('messages', data);

export function resetToInitialData() {
  saveUserProfile(INITIAL_USER);
  saveEvents(INITIAL_EVENTS);
  saveTasks(INITIAL_TASKS);
  saveBills(INITIAL_BILLS);
  saveTransactions(INITIAL_TRANSACTIONS);
  saveReminders(INITIAL_REMINDERS);
  saveAlarms(INITIAL_ALARMS);
  saveAIMemories(INITIAL_AI_MEMORY);
  saveWellbeing(INITIAL_WELLBEING);
  saveChatMessages(INITIAL_MESSAGES);
}

