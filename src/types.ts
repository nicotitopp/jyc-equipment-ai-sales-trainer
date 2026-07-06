export type Mode = 'Coach' | 'Live Call Simulation' | 'Real Call Audit' | 'History';

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface HistoryItem {
  id: string;
  date: string;
  type: 'Live Call' | 'Audio Upload';
  contactName: string;
  companyName: string;
  score: number;
  evaluation: any;
}
