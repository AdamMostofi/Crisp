import { beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { resetDb } from '@/lib/db';

const TEST_DB_DIR = path.join(__dirname, '../../.test-data');

beforeAll(async () => {
  if (!fs.existsSync(TEST_DB_DIR)) {
    fs.mkdirSync(TEST_DB_DIR, { recursive: true });
  }
  process.env.CRISP_DB_DIR = TEST_DB_DIR;
  await resetDb(TEST_DB_DIR);
});

afterAll(async () => {
  await resetDb(TEST_DB_DIR);
  if (fs.existsSync(TEST_DB_DIR)) {
    fs.rmSync(TEST_DB_DIR, { recursive: true, force: true });
  }
});
