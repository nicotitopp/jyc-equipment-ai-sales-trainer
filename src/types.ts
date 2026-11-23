export type Mode = 'Coach' | 'Live Call Simulation' | 'Real Call Audit' | 'History';

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'trainee' | 'admin';
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface HistoryItem {
  id: string;
  userId?: string;
  userName?: string;
  date: string;
  timestamp?: number;
  type: 'Live Call' | 'Audio Upload';
  contactName: string;
  companyName: string;
  score: number;
  evaluation: any;
  hasAudio?: boolean;
  conversationId?: string;
  audioUrl?: string;
  difficulty?: 'friendly' | 'challenging' | 'hardcore' | string;
  durationSecs?: number;
  costUsd?: number;
  creditsUsed?: number;
}

export interface UserSpendStat {
  userId: string;
  username: string;
  name: string;
  role: string;
  callCount: number;
  totalDurationSecs: number;
  totalMinutes: number;
  totalCostUsd: number;
  totalCredits: number;
  avgCostPerCall: number;
  avgMinutesPerCall: number;
  percentageOfTotalCost: number;
  percentageOfTotalTime: number;
  lastActive?: string;
}

export interface SpendAnalytics {
  summary: {
    totalCostUsd: number;
    totalMinutes: number;
    totalHours: number;
    totalCalls: number;
    totalCredits: number;
    avgCostPerCall: number;
    avgMinutesPerCall: number;
  };
  users: UserSpendStat[];
}
