// Daily update: searches the web for new scholarships and changed dates.
// It only ever saves DRAFTS and date SUGGESTIONS. Nothing is published and nothing existing is overwritten.
//
//   node scripts/update.js            run and save
//   node scripts/update.js --dry-run  show what it would save, save nothing
//
// Needs ANTHROPIC_API_KEY. Uses Supabase when SUPABASE_URL and SUPABASE_SERVICE_KEY are set, else the local SQLite file.
import Anthropic from '@anthropic-ai/sdk';
import { openStore } from '../src/store.js';
import { todayIST } from '../shared/eligibility.js';
import { runUpdate } from '../src/update-run.js';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set. Create a key at console.anthropic.com and set it as an environment variable.');
  process.exit(1);
}

const store = await openStore();
try {
  await runUpdate({
    store,
    client: new Anthropic(),
    model: process.env.UPDATE_MODEL || 'claude-opus-5-5',
    today: todayIST(),
    dryRun: process.argv.includes('--dry-run'),
  });
} catch (err) {
  console.error(`Update failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  store.close();
}
