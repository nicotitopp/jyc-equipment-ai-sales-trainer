# Neon PostgreSQL Database & Cloud Persistence Guide

The **JYC Equipment AI Sales Trainer** utilizes **Neon Serverless PostgreSQL** as its primary persistent database engine. This document details the database architecture, schema definitions, connection pooling, automated migrations, and administration instructions.

---

## 🏗️ Architecture Overview

The application features a **hybrid persistence layer** managed by `server/db.ts`:

```mermaid
flowchart TD
    App[Express API & App Server] --> PersistRouter{Persistence Router}
    PersistRouter -->|DATABASE_URL present| NeonPool[Neon PostgreSQL Connection Pooler]
    PersistRouter -->|DATABASE_URL missing / error| LocalFallback[Local JSON Store: data/database.json]
    
    NeonPool --> TableUsers[(users)]
    NeonPool --> TableHistory[(history)]
    NeonPool --> TableAudios[(call_audios)]

    style NeonPool fill:#00E699,stroke:#00A36C,color:#000
    style LocalFallback fill:#F59E0B,stroke:#D97706,color:#000
```

1. **Primary (Neon PostgreSQL):** Serverless, auto-scaling PostgreSQL hosted on AWS us-east-2. All trainee accounts, call records, AI evaluation scorecards, and call recordings are permanently preserved.
2. **Automatic Fallback (Local JSON):** If the database connection is absent or temporarily unreachable, the application automatically falls back to an atomic local file `data/database.json` without crashing.
3. **Auto-Bootstrap & Migration:** Upon server startup (`initDatabase()`), tables are created automatically (`CREATE TABLE IF NOT EXISTS`) and any existing records from local storage are seamlessly synchronized into Neon.

---

## 🗄️ Relational Schema

### 1. `users` Table
Stores authentication accounts, roles, and access control states.

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,           -- 'admin' | 'trainee'
  created_at TEXT,
  blocked BOOLEAN DEFAULT FALSE
);
```

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Unique UUID or deterministic identifier (e.g. `admin_default`). |
| `username` | `TEXT` | `UNIQUE NOT NULL` | Login username (case-insensitive in queries). |
| `password` | `TEXT` | `NOT NULL` | Account password. |
| `name` | `TEXT` | `NOT NULL` | Full display name of the trainee or administrator. |
| `role` | `TEXT` | `NOT NULL` | User role: `'admin'` or `'trainee'`. |
| `created_at` | `TEXT` | | Timestamp or date of registration. |
| `blocked` | `BOOLEAN` | `DEFAULT FALSE` | Access block flag controlled by admins in the dashboard. |

---

### 2. `history` Table
Stores completed voice simulations, uploaded call evaluations, and AI scorecards.

```sql
CREATE TABLE IF NOT EXISTS history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  date TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  type TEXT NOT NULL,           -- 'Live Call' | 'Audio Upload'
  contact_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  score INTEGER NOT NULL,       -- 0 to 100 overall score
  evaluation JSONB NOT NULL,    -- Multimodal AI scorecard breakdown
  has_audio BOOLEAN DEFAULT TRUE,
  conversation_id TEXT,
  audio_url TEXT
);
```

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `TEXT PRIMARY KEY` | Unique call review ID. |
| `user_id` / `user_name` | `TEXT` | Trainee identifier and name. |
| `type` | `TEXT` | `'Live Call'` (ElevenLabs simulation) or `'Audio Upload'` (real MP3/WAV audit). |
| `score` | `INTEGER` | Overall commercial score (0 to 100). |
| `evaluation` | `JSONB` | Structured Gemini AI scorecard breakdown: 10 criteria scores, strengths, mistakes, executive summary, and data plate details. |
| `conversation_id` | `TEXT` | ElevenLabs conversation UUID (for downloading raw two-way audio). |
| `audio_url` | `TEXT` | URL to playback or download call audio. |

---

### 3. `call_audios` Table
Stores raw audio payloads for uploaded calls or offline recordings.

```sql
CREATE TABLE IF NOT EXISTS call_audios (
  id TEXT PRIMARY KEY,
  audio_base64 TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ⚡ Connection & Pooling Configuration

Neon uses connection pooling to handle high concurrency and serverless cold starts. The connection string format is:

```env
DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-fancy-sound-b43gh2we-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Key Parameters:
* **Host (`-pooler`):** Using the `-pooler` subdomain routes connections through Neon's built-in PgBouncer pooler, preventing connection exhaustion during spikes.
* **SSL Mode (`sslmode=require`):** Mandatory for all Neon connections to guarantee encrypted in-transit traffic.
* **Resilient Environment Parsing:** `server/db.ts` supports both `DATABASE_URL` and `NEON_DATABASE_URL`, automatically trimming extraneous whitespace and normalizing case.

---

## 🔍 Health Checks & Live Diagnostics

You can verify the active database connection at any time by requesting the `/api/status` endpoint:

```bash
curl -s https://jyc-equipment-ai-sales-trainer.onrender.com/api/status
```

**Expected JSON Response:**
```json
{
  "status": "ok",
  "service": "JYC Equipment Sales Trainer",
  "timestamp": "2026-11-05T15:10:23.712Z",
  "database": {
    "mode": "postgres",
    "connected": true,
    "hasEnvUrl": true
  },
  "elevenlabs": {
    "keyConfigured": true,
    "agentId": "agent_2501kw2zhyq8ewg9ntqm1613vhek"
  },
  "detectedEnvKeys": [
    "DATABASE_URL",
    "ELEVENLABS_AGENT_ID",
    "ELEVENLABS_API_KEY",
    "GEMINI_API_KEY",
    "NODE_ENV"
  ]
}
```

If `database.mode` is `"postgres"` and `connected` is `true`, your application is operating on Neon.

---

## 🛠️ Managing Data in the Neon Console

1. Navigate to [console.neon.tech](https://console.neon.tech).
2. Select your project: **`fancy-sound`** (or your designated project name).
3. In the left navigation bar, click **Tables** under *Postgres database*.
4. You will see the three managed tables: `users`, `history`, and `call_audios`.
5. You can execute custom SQL queries directly from the **SQL Editor** tab:

```sql
-- View all registered trainees and their roles
SELECT id, username, name, role, blocked, created_at 
FROM users 
ORDER BY role ASC, created_at DESC;

-- View recent call evaluations and scores
SELECT id, user_name, type, contact_name, score, date 
FROM history 
ORDER BY timestamp DESC 
LIMIT 10;
```
