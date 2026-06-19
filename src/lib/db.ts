import { createClient } from '@libsql/client';
import type { Client } from '@libsql/client';
import path from 'path';

let db: Client | null = null;
let initPromise: Promise<void> | null = null;

function getDbDir(): string {
  return process.env.CRISP_DB_DIR ?? path.join(/* turbopackIgnore: true */ process.cwd(), 'data');
}

function getLocalDbPath(): string {
  return path.join(getDbDir(), 'crisp.db');
}

function getOrInitDb(): Client {
  if (!db) {
    if (process.env.TURSO_DB_URL) {
      db = createClient({
        url: process.env.TURSO_DB_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
    } else {
      db = createClient({ url: `file:${getLocalDbPath()}` });
    }
    initPromise = initSchema();
  }
  return db;
}

async function initSchema(): Promise<void> {
  const database = getOrInitDb();
    await database.execute(`
    CREATE TABLE IF NOT EXISTS links (
      short_code TEXT PRIMARY KEY,
      clean_url TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export interface LinkRow {
  short_code: string;
  clean_url: string;
  created_at: string;
}

export async function insertLink(shortCode: string, cleanUrl: string): Promise<boolean> {
  const database = getOrInitDb();
  if (initPromise) await initPromise;
  const result = await database.execute({
    sql: 'INSERT OR IGNORE INTO links (short_code, clean_url) VALUES (?, ?)',
    args: [shortCode, cleanUrl],
  });
  return result.rowsAffected > 0;
}

export async function getLink(shortCode: string): Promise<string | null> {
  const database = getOrInitDb();
  if (initPromise) await initPromise;
  const result = await database.execute({
    sql: 'SELECT clean_url FROM links WHERE short_code = ?',
    args: [shortCode],
  });
  const row = result.rows[0] as unknown as { clean_url: string } | undefined;
  return row?.clean_url ?? null;
}

export async function resetDb(testDir?: string): Promise<void> {
  if (db) {
    db.close();
    db = null;
  }
  initPromise = null;
  if (testDir) {
    const { rmSync, existsSync } = await import('fs');
    const testDbPath = path.join(testDir, 'crisp.db');
    for (const file of [testDbPath, `${testDbPath}-wal`, `${testDbPath}-shm`]) {
      if (existsSync(file)) {
        rmSync(file, { force: true });
      }
    }
  }
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
  initPromise = null;
}
