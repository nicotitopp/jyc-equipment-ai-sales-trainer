import fs from 'fs';
import path from 'path';

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'trainee' | 'admin';
  createdAt?: string;
  blocked?: boolean;
}

export interface DbHistoryItem {
  id: string;
  userId: string;
  userName: string;
  userRole: 'trainee' | 'admin';
  date: string;
  timestamp: number;
  type: 'Live Call' | 'Audio Upload';
  contactName: string;
  companyName: string;
  score: number;
  evaluation: any;
  hasAudio?: boolean;
  conversationId?: string;
  audioUrl?: string;
}

interface DatabaseSchema {
  users: UserAccount[];
  history: DbHistoryItem[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const AUDIOS_DIR = path.join(DATA_DIR, 'audios');

const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'admin_default',
    username: 'admin',
    password: 'JYC!@2026*!!@',
    name: 'Administrador JYC',
    role: 'admin'
  }
];

export function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(AUDIOS_DIR)) {
    fs.mkdirSync(AUDIOS_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = {
      users: DEFAULT_USERS,
      history: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  }
}

function readDb(): DatabaseSchema {
  ensureDirectories();
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (!parsed.users) parsed.users = DEFAULT_USERS;
    if (!parsed.history) parsed.history = [];
    return parsed;
  } catch (err) {
    console.error('Error reading database file, resetting to default:', err);
    const initialDb: DatabaseSchema = {
      users: DEFAULT_USERS,
      history: []
    };
    return initialDb;
  }
}

function writeDb(data: DatabaseSchema) {
  ensureDirectories();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

export function authenticate(username: string, password?: string, customName?: string): { id: string; username: string; name: string; role: 'trainee' | 'admin' } | null {
  const db = readDb();
  const cleanUsername = (username || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  // Password is required for all roles
  if (!cleanPassword) {
    return null;
  }

  // Match predefined users
  const user = db.users.find(u => u.username.toLowerCase() === cleanUsername);

  if (user) {
    // Strictly verify password
    if (user.password !== cleanPassword) {
      return null;
    }

    const displayName = (user.role === 'trainee' && customName?.trim()) 
      ? customName.trim() 
      : user.name;

    return {
      id: user.id,
      username: user.username,
      name: displayName,
      role: user.role,
      blocked: !!user.blocked
    };
  }

  return null;
}

export function updateUserPassword(username: string, newPassword: string): boolean {
  const db = readDb();
  const cleanUsername = username.trim().toLowerCase();
  const user = db.users.find(u => u.username.toLowerCase() === cleanUsername);
  if (user) {
    user.password = newPassword.trim();
    writeDb(db);
    return true;
  }
  return false;
}

export function createUser(username: string, password: string, name: string): { success: boolean; user?: Omit<UserAccount, 'password'>; error?: string } {
  const db = readDb();
  const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
  const cleanPassword = password.trim();
  const cleanName = name.trim();

  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: "El nombre de usuario debe tener al menos 3 caracteres." };
  }
  if (!cleanPassword || cleanPassword.length < 4) {
    return { success: false, error: "La contraseña debe tener al menos 4 caracteres." };
  }
  if (!cleanName) {
    return { success: false, error: "El nombre completo del vendedor es requerido." };
  }

  const existing = db.users.find(u => u.username.toLowerCase() === cleanUsername);
  if (existing) {
    return { success: false, error: `El nombre de usuario '${cleanUsername}' ya está registrado.` };
  }

  const newUser: UserAccount = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    username: cleanUsername,
    password: cleanPassword,
    name: cleanName,
    role: 'trainee',
    createdAt: new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  };

  db.users.push(newUser);
  writeDb(db);

  return {
    success: true,
    user: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role
    }
  };
}

export function deleteUser(username: string): { success: boolean; error?: string } {
  const db = readDb();
  const cleanUsername = username.trim().toLowerCase();

  if (cleanUsername === 'admin') {
    return { success: false, error: "No es posible eliminar al Administrador principal." };
  }

  const index = db.users.findIndex(u => u.username.toLowerCase() === cleanUsername);
  if (index === -1) {
    return { success: false, error: "Usuario no encontrado." };
  }

  db.users.splice(index, 1);
  writeDb(db);
  return { success: true };
}

export function toggleUserBlock(username: string): { success: boolean; blocked?: boolean; error?: string } {
  const db = readDb();
  const cleanUsername = username.trim().toLowerCase();

  if (cleanUsername === 'admin') {
    return { success: false, error: "No es posible bloquear la cuenta del Administrador principal." };
  }

  const user = db.users.find(u => u.username.toLowerCase() === cleanUsername);
  if (!user) {
    return { success: false, error: "Usuario no encontrado." };
  }

  user.blocked = !user.blocked;
  writeDb(db);

  return { success: true, blocked: user.blocked };
}

export interface DetailedUserRecord {
  id: string;
  username: string;
  name: string;
  role: 'trainee' | 'admin';
  password: string;
  createdAt: string;
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

export function getAllUsersWithStats(): DetailedUserRecord[] {
  const db = readDb();
  return db.users.map(u => {
    const userCalls = (db.history || []).filter(h => 
      h.userId === u.id || 
      h.userName?.toLowerCase() === u.name.toLowerCase() ||
      h.userName?.toLowerCase() === u.username.toLowerCase()
    ).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    const count = userCalls.length;
    const avgScore = count > 0 ? Math.round(userCalls.reduce((acc, curr) => acc + curr.score, 0) / count) : 0;
    const bestScore = count > 0 ? Math.max(...userCalls.map(c => c.score || 0)) : 0;
    const passedCount = userCalls.filter(c => (c.score || 0) >= 70).length;
    const passRate = count > 0 ? Math.round((passedCount / count) * 100) : 0;
    const lastActive = count > 0 ? userCalls[0].date : undefined;

    const recentCalls = userCalls.slice(0, 5).map(c => ({
      id: c.id,
      date: c.date,
      companyName: c.companyName,
      contactName: c.contactName,
      score: c.score,
      type: c.type
    }));

    return {
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      password: u.password,
      createdAt: u.createdAt || 'Registrado',
      blocked: !!u.blocked,
      callCount: count,
      avgScore,
      bestScore,
      passRate,
      lastActive,
      recentCalls
    };
  });
}

export function getAllUsers(): { id: string; username: string; name: string; role: 'trainee' | 'admin' }[] {
  const db = readDb();
  return db.users.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role
  }));
}

export function getHistory(filter?: { role?: string; userId?: string; userName?: string }): DbHistoryItem[] {
  const db = readDb();
  let list = db.history || [];

  if (filter?.role === 'trainee' && (filter.userId || filter.userName)) {
    list = list.filter(item => 
      (filter.userId && item.userId === filter.userId) ||
      (filter.userName && item.userName?.toLowerCase() === filter.userName.toLowerCase())
    );
  }

  // Sort descending by timestamp or date
  return list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

export function saveHistoryItem(item: Omit<DbHistoryItem, 'timestamp'> & { timestamp?: number }): DbHistoryItem {
  const db = readDb();
  const fullItem: DbHistoryItem = {
    ...item,
    timestamp: item.timestamp || Date.now()
  };

  // Avoid duplicates
  const existingIdx = db.history.findIndex(h => h.id === fullItem.id);
  if (existingIdx >= 0) {
    db.history[existingIdx] = fullItem;
  } else {
    db.history.unshift(fullItem);
  }

  writeDb(db);
  return fullItem;
}

export function deleteHistoryItem(id: string): boolean {
  const db = readDb();
  const initialLength = db.history.length;
  db.history = db.history.filter(h => h.id !== id);
  if (db.history.length !== initialLength) {
    writeDb(db);
    return true;
  }
  return false;
}

export function clearHistory(filter?: { userId?: string }): void {
  const db = readDb();
  if (filter?.userId) {
    db.history = db.history.filter(h => h.userId !== filter.userId);
  } else {
    db.history = [];
  }
  writeDb(db);
}

export function getRegisteredTrainees(): { id: string; name: string; username: string; callCount: number; avgScore: number }[] {
  const db = readDb();
  const traineeMap = new Map<string, { id: string; name: string; username: string; callCount: number; totalScore: number }>();

  // Add default trainee
  traineeMap.set('Vendedor Practicante', {
    id: 'trainee_default',
    name: 'Vendedor Practicante',
    username: 'practicante',
    callCount: 0,
    totalScore: 0
  });

  for (const h of db.history) {
    if (h.userRole === 'admin') continue;
    const key = h.userName || h.userId || 'Practicante';
    const existing = traineeMap.get(key) || {
      id: h.userId || key,
      name: h.userName || key,
      username: key.toLowerCase().replace(/\s+/g, '_'),
      callCount: 0,
      totalScore: 0
    };
    existing.callCount += 1;
    existing.totalScore += (h.score || 0);
    traineeMap.set(key, existing);
  }

  return Array.from(traineeMap.values()).map(t => ({
    id: t.id,
    name: t.name,
    username: t.username,
    callCount: t.callCount,
    avgScore: t.callCount > 0 ? Math.round(t.totalScore / t.callCount) : 0
  }));
}

export function saveAudioFile(id: string, base64Data: string, mimeType: string = 'audio/mpeg'): string {
  ensureDirectories();
  const filePath = path.join(AUDIOS_DIR, `${id}.audio`);
  const metaPath = path.join(AUDIOS_DIR, `${id}.meta.json`);
  
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(filePath, buffer);
  fs.writeFileSync(metaPath, JSON.stringify({ mimeType, size: buffer.length, createdAt: new Date().toISOString() }));
  
  return `/api/audios/${id}`;
}

export function getAudioFile(id: string): { buffer: Buffer; mimeType: string } | null {
  ensureDirectories();
  const filePath = path.join(AUDIOS_DIR, `${id}.audio`);
  const metaPath = path.join(AUDIOS_DIR, `${id}.meta.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const buffer = fs.readFileSync(filePath);
  let mimeType = 'audio/mpeg';

  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      if (meta.mimeType) mimeType = meta.mimeType;
    } catch {}
  }

  return { buffer, mimeType };
}
