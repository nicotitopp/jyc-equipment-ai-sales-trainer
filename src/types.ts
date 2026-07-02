export type Mode = 'Coach' | 'Live Call Simulation';

export interface Message {
  role: 'user' | 'model';
  content: string;
}
