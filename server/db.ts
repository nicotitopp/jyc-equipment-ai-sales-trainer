import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

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
    role: 'admin',
    createdAt: 'Registrado por Sistema',
    blocked: false
  }
];

// PostgreSQL Client Pool
let pgPool: Pool | null = null;

function resolveDatabaseUrl(): string | null {
  // Check common environment variable names
  const direct = process.env.DATABASE_URL || 
                 process.env.POSTGRES_URL || 
                 process.env.DATABASE_URI || 
                 process.env.NEON_DATABASE_URL;

  if (direct && direct.trim()) {
    return direct.trim().replace(/^["']|["']$/g, '');
  }

  // Check case-insensitive or trimmed key variations
  for (const [key, val] of Object.entries(process.env)) {
    const upper = key.trim().toUpperCase();
    if ((upper === 'DATABASE_URL' || upper === 'DATABASEURL' || upper === 'POSTGRES_URL') && val && val.trim()) {
      return val.trim().replace(/^["']|["']$/g, '');
    }
  }

  return null;
}

export function getPgPool(): Pool | null {
  if (pgPool) return pgPool;
  const databaseUrl = resolveDatabaseUrl();
  if (!databaseUrl) return null;

  try {
    const isLocal = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
    pgPool = new Pool({
      connectionString: databaseUrl,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    return pgPool;
  } catch (err) {
    console.error('[DB] Failed to initialize PostgreSQL pool:', err);
    return null;
  }
}

export async function ensureDirectories() {
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

export async function initDatabase() {
  await ensureDirectories();
  const pool = getPgPool();

  if (!pool) {
    console.log('[DB] No DATABASE_URL provided. Operating in local JSON mode (data/database.json).');
    const matchedKeys = Object.keys(process.env).filter(k => 
      k.toUpperCase().includes('DATA') || 
      k.toUpperCase().includes('POST') || 
      k.toUpperCase().includes('DB')
    );
    if (matchedKeys.length > 0) {
      console.log('[DB] Related env keys detected in container:', matchedKeys.join(', '));
    }
    return;
  }

  try {
    console.log('[DB] Connecting to PostgreSQL database...');
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT,
        blocked BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_role TEXT NOT NULL,
        date TEXT NOT NULL,
        timestamp BIGINT NOT NULL,
        type TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        company_name TEXT NOT NULL,
        score INTEGER NOT NULL,
        evaluation JSONB NOT NULL,
        has_audio BOOLEAN DEFAULT TRUE,
        conversation_id TEXT,
        audio_url TEXT
      );

      CREATE TABLE IF NOT EXISTS call_audios (
        id TEXT PRIMARY KEY,
        audio_base64 TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure default admin exists
    await pool.query(`
      INSERT INTO users (id, username, password, name, role, created_at, blocked)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (username) DO NOTHING;
    `, [
      'admin_default',
      'admin',
      'JYC!@2026*!!@',
      'Administrador JYC',
      'admin',
      'Registrado por Sistema',
      false
    ]);

    // Migrate any users from local JSON file to PostgreSQL if they don't exist yet
    try {
      const local = readDb();
      for (const u of local.users) {
        if (u.username !== 'admin') {
          await pool.query(`
            INSERT INTO users (id, username, password, name, role, created_at, blocked)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (username) DO NOTHING;
          `, [
            u.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            u.username.toLowerCase().trim(),
            u.password,
            u.name,
            u.role || 'trainee',
            u.createdAt || 'Migrado de JSON',
            !!u.blocked
          ]);
        }
      }
      for (const h of local.history) {
        await pool.query(`
          INSERT INTO history (id, user_id, user_name, user_role, date, timestamp, type, contact_name, company_name, score, evaluation, has_audio, conversation_id, audio_url)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO NOTHING;
        `, [
          h.id,
          h.userId,
          h.userName,
          h.userRole,
          h.date,
          h.timestamp || Date.now(),
          h.type,
          h.contactName,
          h.companyName,
          h.score,
          JSON.stringify(h.evaluation),
          h.hasAudio ?? true,
          h.conversationId || null,
          h.audioUrl || null
        ]);
      }
    } catch (migErr) {
      console.warn('[DB] Non-critical migration note:', migErr);
    }

    console.log('[DB] PostgreSQL database initialized successfully & fully persistent.');
  } catch (err: any) {
    console.error('[DB] PostgreSQL initialization failed, falling back to local JSON:', err.message);
  }
}

export async function getDatabaseStatus(): Promise<{
  mode: 'postgres' | 'local_json';
  connected: boolean;
  hasEnvUrl: boolean;
  error?: string;
}> {
  const pool = getPgPool();
  if (pool) {
    try {
      await pool.query('SELECT NOW()');
      return {
        mode: 'postgres',
        connected: true,
        hasEnvUrl: true,
      };
    } catch (err: any) {
      return {
        mode: 'postgres',
        connected: false,
        hasEnvUrl: true,
        error: err.message,
      };
    }
  }
  return {
    mode: 'local_json',
    connected: true,
    hasEnvUrl: false,
  };
}

// Local JSON fallback helpers
function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { users: DEFAULT_USERS, history: [] };
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (!parsed.users) parsed.users = DEFAULT_USERS;
    if (!parsed.history) parsed.history = [];
    return parsed;
  } catch (err) {
    return { users: DEFAULT_USERS, history: [] };
  }
}

function writeDb(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// ==========================================================
// Authentication
// ==========================================================
export async function authenticate(
  username: string, 
  password?: string, 
  customName?: string
): Promise<{ id: string; username: string; name: string; role: 'trainee' | 'admin'; blocked?: boolean } | null> {
  const cleanUsername = (username || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanPassword) return null;

  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query(
        'SELECT id, username, password, name, role, blocked FROM users WHERE LOWER(username) = $1',
        [cleanUsername]
      );
      if (res.rows.length > 0) {
        const u = res.rows[0];
        if (u.password !== cleanPassword) return null;

        const displayName = (u.role === 'trainee' && customName?.trim()) 
          ? customName.trim() 
          : u.name;

        return {
          id: u.id,
          username: u.username,
          name: displayName,
          role: u.role,
          blocked: !!u.blocked
        };
      }
      return null;
    } catch (err) {
      console.error('[DB] Error during PG authenticate, falling back to JSON:', err);
    }
  }

  // Fallback JSON
  const db = readDb();
  const user = db.users.find(u => u.username.toLowerCase() === cleanUsername);
  if (user && user.password === cleanPassword) {
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

export async function updateUserPassword(username: string, newPassword: string): Promise<boolean> {
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = newPassword.trim();
  const pool = getPgPool();

  if (pool) {
    try {
      const res = await pool.query(
        'UPDATE users SET password = $1 WHERE LOWER(username) = $2',
        [cleanPassword, cleanUsername]
      );
      return (res.rowCount ?? 0) > 0;
    } catch (err) {
      console.error('[DB] Error during PG updateUserPassword:', err);
    }
  }

  // Fallback JSON
  const db = readDb();
  const user = db.users.find(u => u.username.toLowerCase() === cleanUsername);
  if (user) {
    user.password = cleanPassword;
    writeDb(db);
    return true;
  }
  return false;
}

export async function createUser(
  username: string, 
  password: string, 
  name: string
): Promise<{ success: boolean; user?: Omit<UserAccount, 'password'>; error?: string }> {
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

  const pool = getPgPool();
  if (pool) {
    try {
      const existing = await pool.query('SELECT id FROM users WHERE LOWER(username) = $1', [cleanUsername]);
      if (existing.rows.length > 0) {
        return { success: false, error: `El nombre de usuario '${cleanUsername}' ya está registrado.` };
      }

      const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const createdAt = new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      await pool.query(`
        INSERT INTO users (id, username, password, name, role, created_at, blocked)
        VALUES ($1, $2, $3, $4, 'trainee', $5, false)
      `, [id, cleanUsername, cleanPassword, cleanName, createdAt]);

      return {
        success: true,
        user: {
          id,
          username: cleanUsername,
          name: cleanName,
          role: 'trainee',
          createdAt,
          blocked: false
        }
      };
    } catch (err: any) {
      console.error('[DB] Error creating user in PG:', err);
      return { success: false, error: err.message || 'Error en base de datos.' };
    }
  }

  // Fallback JSON
  const db = readDb();
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
    }),
    blocked: false
  };

  db.users.push(newUser);
  writeDb(db);

  return {
    success: true,
    user: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt,
      blocked: false
    }
  };
}

export async function deleteUser(username: string): Promise<{ success: boolean; error?: string }> {
  const cleanUsername = username.trim().toLowerCase();

  if (cleanUsername === 'admin') {
    return { success: false, error: "No es posible eliminar al Administrador principal." };
  }

  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query('DELETE FROM users WHERE LOWER(username) = $1', [cleanUsername]);
      if ((res.rowCount ?? 0) > 0) {
        return { success: true };
      }
      return { success: false, error: "Usuario no encontrado." };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Fallback JSON
  const db = readDb();
  const index = db.users.findIndex(u => u.username.toLowerCase() === cleanUsername);
  if (index === -1) {
    return { success: false, error: "Usuario no encontrado." };
  }

  db.users.splice(index, 1);
  writeDb(db);
  return { success: true };
}

export async function toggleUserBlock(username: string): Promise<{ success: boolean; blocked?: boolean; error?: string }> {
  const cleanUsername = username.trim().toLowerCase();

  if (cleanUsername === 'admin') {
    return { success: false, error: "No es posible bloquear la cuenta del Administrador principal." };
  }

  const pool = getPgPool();
  if (pool) {
    try {
      const current = await pool.query('SELECT blocked FROM users WHERE LOWER(username) = $1', [cleanUsername]);
      if (current.rows.length === 0) {
        return { success: false, error: "Usuario no encontrado." };
      }
      const newBlocked = !current.rows[0].blocked;
      await pool.query('UPDATE users SET blocked = $1 WHERE LOWER(username) = $2', [newBlocked, cleanUsername]);
      return { success: true, blocked: newBlocked };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Fallback JSON
  const db = readDb();
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

export async function getAllUsersWithStats(): Promise<DetailedUserRecord[]> {
  const pool = getPgPool();
  if (pool) {
    try {
      const usersRes = await pool.query('SELECT id, username, password, name, role, created_at as "createdAt", blocked FROM users ORDER BY role ASC, created_at DESC');
      const historyRes = await pool.query('SELECT id, user_id, user_name, date, timestamp, type, contact_name, company_name, score FROM history ORDER BY timestamp DESC');

      const allUsers = usersRes.rows;
      const allHistory = historyRes.rows;

      return allUsers.map(u => {
        const userCalls = allHistory.filter(h =>
          h.user_id === u.id ||
          h.user_name?.toLowerCase() === u.name.toLowerCase() ||
          h.user_name?.toLowerCase() === u.username.toLowerCase()
        );

        const count = userCalls.length;
        const avgScore = count > 0 ? Math.round(userCalls.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0) / count) : 0;
        const bestScore = count > 0 ? Math.max(...userCalls.map(c => Number(c.score) || 0)) : 0;
        const passedCount = userCalls.filter(c => (Number(c.score) || 0) >= 70).length;
        const passRate = count > 0 ? Math.round((passedCount / count) * 100) : 0;
        const lastActive = count > 0 ? userCalls[0].date : undefined;

        const recentCalls = userCalls.slice(0, 5).map(c => ({
          id: c.id,
          date: c.date,
          companyName: c.company_name,
          contactName: c.contact_name,
          score: Number(c.score) || 0,
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
    } catch (err) {
      console.error('[DB] Error during PG getAllUsersWithStats:', err);
    }
  }

  // Fallback JSON
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

export async function getAllUsers(): Promise<{ id: string; username: string; name: string; role: 'trainee' | 'admin' }[]> {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query('SELECT id, username, name, role FROM users ORDER BY username ASC');
      return res.rows;
    } catch (err) {
      console.error('[DB] Error during PG getAllUsers:', err);
    }
  }

  const db = readDb();
  return db.users.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role
  }));
}

// ==========================================================
// History & Audits
// ==========================================================
export async function getHistory(filter?: { role?: string; userId?: string; userName?: string }): Promise<DbHistoryItem[]> {
  const pool = getPgPool();
  if (pool) {
    try {
      let query = `
        SELECT 
          id, 
          user_id as "userId", 
          user_name as "userName", 
          user_role as "userRole", 
          date, 
          timestamp, 
          type, 
          contact_name as "contactName", 
          company_name as "companyName", 
          score, 
          evaluation, 
          has_audio as "hasAudio", 
          conversation_id as "conversationId", 
          audio_url as "audioUrl"
        FROM history
      `;
      const params: any[] = [];

      if (filter?.role === 'trainee' && (filter.userId || filter.userName)) {
        if (filter.userId) {
          params.push(filter.userId);
          query += ` WHERE user_id = $${params.length}`;
        } else if (filter.userName) {
          params.push(filter.userName.toLowerCase());
          query += ` WHERE LOWER(user_name) = $${params.length}`;
        }
      }

      query += ` ORDER BY timestamp DESC`;

      const res = await pool.query(query, params);
      return res.rows.map(r => ({
        ...r,
        timestamp: Number(r.timestamp),
        score: Number(r.score),
        evaluation: typeof r.evaluation === 'string' ? JSON.parse(r.evaluation) : r.evaluation
      }));
    } catch (err) {
      console.error('[DB] Error during PG getHistory:', err);
    }
  }

  // Fallback JSON
  const db = readDb();
  let list = db.history || [];

  if (filter?.role === 'trainee' && (filter.userId || filter.userName)) {
    list = list.filter(item => 
      (filter.userId && item.userId === filter.userId) ||
      (filter.userName && item.userName?.toLowerCase() === filter.userName.toLowerCase())
    );
  }

  return list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

export async function saveHistoryItem(item: Omit<DbHistoryItem, 'timestamp'> & { timestamp?: number }): Promise<DbHistoryItem> {
  const fullItem: DbHistoryItem = {
    ...item,
    timestamp: item.timestamp || Date.now()
  };

  const pool = getPgPool();
  if (pool) {
    try {
      await pool.query(`
        INSERT INTO history (id, user_id, user_name, user_role, date, timestamp, type, contact_name, company_name, score, evaluation, has_audio, conversation_id, audio_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          score = EXCLUDED.score,
          evaluation = EXCLUDED.evaluation,
          audio_url = COALESCE(EXCLUDED.audio_url, history.audio_url)
      `, [
        fullItem.id,
        fullItem.userId,
        fullItem.userName,
        fullItem.userRole,
        fullItem.date,
        fullItem.timestamp,
        fullItem.type,
        fullItem.contactName,
        fullItem.companyName,
        fullItem.score,
        JSON.stringify(fullItem.evaluation),
        fullItem.hasAudio ?? true,
        fullItem.conversationId || null,
        fullItem.audioUrl || null
      ]);
      return fullItem;
    } catch (err) {
      console.error('[DB] Error saving history to PG:', err);
    }
  }

  // Fallback JSON
  const db = readDb();
  const existingIdx = db.history.findIndex(h => h.id === fullItem.id);
  if (existingIdx >= 0) {
    db.history[existingIdx] = fullItem;
  } else {
    db.history.unshift(fullItem);
  }
  writeDb(db);
  return fullItem;
}

export async function deleteHistoryItem(id: string): Promise<boolean> {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query('DELETE FROM history WHERE id = $1', [id]);
      return (res.rowCount ?? 0) > 0;
    } catch (err) {
      console.error('[DB] Error deleting history from PG:', err);
    }
  }

  // Fallback JSON
  const db = readDb();
  const initialLength = db.history.length;
  db.history = db.history.filter(h => h.id !== id);
  if (db.history.length !== initialLength) {
    writeDb(db);
    return true;
  }
  return false;
}

export async function clearHistory(filter?: { userId?: string }): Promise<void> {
  const pool = getPgPool();
  if (pool) {
    try {
      if (filter?.userId) {
        await pool.query('DELETE FROM history WHERE user_id = $1', [filter.userId]);
      } else {
        await pool.query('DELETE FROM history');
      }
      return;
    } catch (err) {
      console.error('[DB] Error clearing history in PG:', err);
    }
  }

  // Fallback JSON
  const db = readDb();
  if (filter?.userId) {
    db.history = db.history.filter(h => h.userId !== filter.userId);
  } else {
    db.history = [];
  }
  writeDb(db);
}

export async function getRegisteredTrainees(): Promise<{ id: string; name: string; username: string; callCount: number; avgScore: number }[]> {
  const history = await getHistory();
  const traineeMap = new Map<string, { id: string; name: string; username: string; callCount: number; totalScore: number }>();

  // Add default trainee
  traineeMap.set('Vendedor Practicante', {
    id: 'trainee_default',
    name: 'Vendedor Practicante',
    username: 'practicante',
    callCount: 0,
    totalScore: 0
  });

  for (const h of history) {
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

// ==========================================================
// Audio Storage (Dual Storage: Cloud Postgres DB + Local Cache)
// ==========================================================
export async function saveAudioFile(id: string, base64Data: string, mimeType: string = 'audio/mpeg'): Promise<string> {
  // Always write local file as quick cache
  try {
    ensureDirectories();
    const filePath = path.join(AUDIOS_DIR, `${id}.audio`);
    const metaPath = path.join(AUDIOS_DIR, `${id}.meta.json`);
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);
    fs.writeFileSync(metaPath, JSON.stringify({ mimeType, size: buffer.length, createdAt: new Date().toISOString() }));
  } catch (err) {
    console.warn('[DB] Could not save audio to local disk:', err);
  }

  // Also store in PostgreSQL if available (survives Render restarts!)
  const pool = getPgPool();
  if (pool) {
    try {
      await pool.query(`
        INSERT INTO call_audios (id, audio_base64, mime_type)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET
          audio_base64 = EXCLUDED.audio_base64,
          mime_type = EXCLUDED.mime_type
      `, [id, base64Data, mimeType]);
    } catch (err) {
      console.error('[DB] Error saving audio to PG call_audios:', err);
    }
  }

  return `/api/audios/${id}`;
}

export async function getAudioFile(id: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
  // 1. Try PostgreSQL first if configured (permanent cloud storage)
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query('SELECT audio_base64, mime_type FROM call_audios WHERE id = $1', [id]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        const buffer = Buffer.from(row.audio_base64, 'base64');
        return { buffer, mimeType: row.mime_type || 'audio/mpeg' };
      }
    } catch (err) {
      console.error('[DB] Error reading audio from PG call_audios:', err);
    }
  }

  // 2. Try local filesystem cache
  try {
    const filePath = path.join(AUDIOS_DIR, `${id}.audio`);
    const metaPath = path.join(AUDIOS_DIR, `${id}.meta.json`);

    if (fs.existsSync(filePath)) {
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
  } catch (err) {
    console.warn('[DB] Error reading audio from local cache:', err);
  }

  return null;
}
