import { Message, HistoryItem, User } from '../types';

export interface UserStats {
  id: string;
  username: string;
  name: string;
  role: 'trainee' | 'admin';
  password?: string;
  createdAt?: string;
  blocked?: boolean;
  callCount: number;
  avgScore: number;
  bestScore: number;
  passRate: number;
  lastActive?: string;
  recentCalls: {
    id: string;
    date: string;
    companyName: string;
    contactName: string;
    score: number;
    type: string;
  }[];
}

export const api = {
  // Authentication
  async login(username: string, password: string, customName?: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, customName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Credenciales incorrectas');
    return data;
  },

  // Gemini Chat
  async sendChatMessage(messages: Message[], systemInstruction: string): Promise<string> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemInstruction }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al comunicarse con el coach');
    return data.text;
  },

  // Call Audit
  async auditAudio(audioBase64: string, mimeType: string): Promise<any> {
    const res = await fetch('/api/audit-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64, mimeType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al analizar el audio');
    return data;
  },

  // History
  async fetchHistory(user: User): Promise<HistoryItem[]> {
    const url = user.role === 'admin'
      ? '/api/history?role=admin'
      : `/api/history?role=trainee&userId=${user.id}&userName=${encodeURIComponent(user.name)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.history) ? data.history : [];
  },

  async saveHistoryItem(item: HistoryItem, role: 'trainee' | 'admin'): Promise<void> {
    await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, userRole: role }),
    });
  },

  async deleteHistoryItem(id: string): Promise<void> {
    await fetch(`/api/history/${id}`, { method: 'DELETE' });
  },

  async clearHistory(role: string, userId?: string): Promise<void> {
    await fetch('/api/history/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, userId }),
    });
  },

  // Audio Upload & Retrieval
  async uploadAudio(id: string, audioBase64: string, mimeType: string): Promise<string | undefined> {
    const res = await fetch('/api/audios/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, audioBase64, mimeType }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.audioUrl;
    }
    return undefined;
  },

  // User Management (Admin)
  async fetchUserList(): Promise<UserStats[]> {
    const res = await fetch('/api/users/list');
    if (!res.ok) throw new Error('Error al obtener lista de usuarios');
    const data = await res.json();
    return data.users || [];
  },

  async createUser(user: { username: string; password: string; name: string }): Promise<void> {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, requesterRole: 'admin' }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear usuario');
  },

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    const res = await fetch(`/api/admin/users/${userId}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword, requesterRole: 'admin' }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar contraseña');
  },

  async toggleUserBlock(userId: string): Promise<boolean> {
    const res = await fetch(`/api/admin/users/${userId}/block`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterRole: 'admin' }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al cambiar estado');
    return data.blocked;
  },

  async deleteUser(userId: string): Promise<void> {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterRole: 'admin' }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al eliminar usuario');
  },
};
