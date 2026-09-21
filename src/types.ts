export type PriorityLevel = 'urgent' | 'important' | 'attention' | 'normal';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  primaryGoal: string;
  wakeTime: string;
  sleepTime: string;
  workStartTime: string;
  useFinances: boolean;
  enableNotifications: boolean;
  enableVoice: boolean;
  plan: 'free' | 'premium';
  monthlyPrice: number;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: PriorityLevel;
  dueDate?: string;
  category: string;
  recurrence?: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  location?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  reminderMinutes?: number;
  priority?: PriorityLevel;
}

export interface ReminderItem {
  id: string;
  userId: string;
  title: string;
  date: string; // YYYY-MM-DD or descriptive
  time: string; // HH:MM
  recurrence?: 'none' | 'daily' | 'monthly';
  status: 'active' | 'completed';
  locationTrigger?: string; // Architecture preparation for background geo-fencing
}

export interface AlarmItem {
  id: string;
  userId: string;
  time: string; // HH:MM
  label: string;
  days: string[]; // e.g., ["Seg", "Ter", "Qua", "Qui", "Sex"]
  active: boolean;
}

export interface FinancialTransaction {
  id: string;
  userId: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface BillItem {
  id: string;
  userId: string;
  name: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  category: string;
  recurrence: 'once' | 'monthly' | 'yearly';
  status: 'upcoming' | 'overdue' | 'paid';
}

export interface AIActionPayload {
  type: string;
  description: string;
  data?: any;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionPayload?: AIActionPayload;
  requiresConfirmation?: boolean;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'orbi';
  text: string;
  timestamp: string;
  intent?: string;
  actionType?: string | null;
  actionPayload?: any;
  status?: 'pending_confirmation' | 'confirmed' | 'cancelled' | 'executed';
  isAudio?: boolean;
}

export interface ProactiveSuggestion {
  id: string;
  category: 'agenda' | 'finance' | 'tasks' | 'focus';
  title: string;
  description: string;
  priority: PriorityLevel;
  actionLabel: string;
  actionTab: 'dashboard' | 'agenda' | 'tasks' | 'finance' | 'orbi' | 'focus';
}

export interface AIMemoryItem {
  id: string;
  category: string;
  fact: string;
  dateLearned: string;
  enabled: boolean;
}

export interface DigitalWellbeingStats {
  todayTotalMinutes: number;
  categoryMinutes: {
    agenda: number;
    tasks: number;
    finances: number;
    orbi: number;
    focus: number;
  };
  focusGoalMinutes: number;
  completedFocusMinutes: number;
}
