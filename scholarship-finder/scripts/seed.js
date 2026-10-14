// Loads seed/scholarships.json into the database (SQLite locally, or Supabase when its env vars are set).
// Rows that already exist are kept (so admin edits survive). Pass --update to overwrite them from the file,
// or --replace to delete everything first (SQLite only).
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { openStore } from '../src/store.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const store = await openStore();
const rows = JSON.parse(readFileSync(join(root, 'seed', 'scholarships.json'), 'utf8'));
const count = await store.seed(rows, { replace: process.argv.includes('--replace'), update: process.argv.includes('--update') });
console.log(`Loaded ${count} scholarships into ${store.kind}`);
store.close();
