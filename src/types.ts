export type Mode = 'Coach' | 'Roleplay' | 'Evaluation' | 'Live Call Simulation';

export interface Message {
  role: 'user' | 'model';
  content: string;
}
