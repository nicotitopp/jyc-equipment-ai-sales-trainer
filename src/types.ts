export type Mode = 'Coach' | 'Live Call Simulation' | 'Real Call Audit';

export interface Message {
  role: 'user' | 'model';
  content: string;
}
