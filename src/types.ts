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
}
