import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = process.env.CRISP_DB_DIR ?? path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'crisp.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

/** Reinitializes the database with a fresh file. Used in tests. */
export function resetDb(testDir: string): void {
  if (db) {
    db.close();
    db = null;
  }
  const testDbPath = path.join(testDir, 'crisp.db');
  if (fs.existsSync(testDbPath)) {
    fs.rmSync(testDbPath, { force: true });
  }
  const testWalPath = path.join(testDir, 'crisp.db-wal');
  if (fs.existsSync(testWalPath)) {
    fs.rmSync(testWalPath, { force: true });
  }
  const testShmPath = path.join(testDir, 'crisp.db-shm');
  if (fs.existsSync(testShmPath)) {
    fs.rmSync(testShmPath, { force: true });
  }
}

function initSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS links (
      short_code TEXT PRIMARY KEY,
      clean_url TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

export interface LinkRow {
  short_code: string;
  clean_url: string;
  created_at: string;
}

export function insertLink(shortCode: string, cleanUrl: string): boolean {
  const database = getDb();
  const stmt = database.prepare(
    'INSERT OR IGNORE INTO links (short_code, clean_url) VALUES (?, ?)'
  );
  const result = stmt.run(shortCode, cleanUrl);
  return result.changes > 0;
}

export function getLink(shortCode: string): string | null {
  const database = getDb();
  const stmt = database.prepare(
    'SELECT clean_url FROM links WHERE short_code = ?'
  );
  const row = stmt.get(shortCode) as { clean_url: string } | undefined;
  return row?.clean_url ?? null;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
