// Loads seed/scholarships.json into the database. Existing rows with the same id are updated.
// Pass --replace to delete everything first.
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { openDb, loadSeed } from '../src/db.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = process.env.DB_PATH || join(root, 'data', 'scholarships.db');
mkdirSync(dirname(dbPath), { recursive: true });

const db = openDb(dbPath);
const count = loadSeed(db, join(root, 'seed', 'scholarships.json'), { replace: process.argv.includes('--replace') });
console.log(`Loaded ${count} scholarships into ${dbPath}`);
db.close();
