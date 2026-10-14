// Checks that the database is reachable and that reading and writing work. Run it after setting up Supabase:
//   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npm run check-store
// It writes one temporary draft scholarship and one suggestion, reads them back, then deletes the scholarship.
// Nothing is published, and no student data is touched.
import { openStore } from '../src/store.js';

const store = await openStore();
const id = `zz-store-check-${Date.now()}`;
const step = async (label, fn) => {
  try {
    const out = await fn();
    console.log(`ok   ${label}`);
    return out;
  } catch (err) {
    console.error(`FAIL ${label}: ${err.message}`);
    process.exitCode = 1;
    throw err;
  }
};

console.log(`Using ${store.kind}`);
try {
  await step('connect', () => store.ping());
  await step('write a draft scholarship', () =>
    store.save({
      id, name: 'Store check (safe to delete)', provider: 'check', levels: ['ug'], categories: [], gender: 'any',
      state: 'All India', official_link: 'https://example.org', status: 'draft', documents: ['a'], apply_steps: ['b'],
      required_groups: [], disability_only: false,
    }),
  );
  const back = await step('read it back', () => store.get(id));
  if (!back || back.name !== 'Store check (safe to delete)') throw new Error('read-back did not match');
  await step('it is not visible to students (draft)', async () => {
    if ((await store.listPublished()).some((s) => s.id === id)) throw new Error('a draft showed up as published');
  });
  await step('write and resolve a suggestion', async () => {
    await store.addSuggestion({ scholarship_id: id, field: 'last_date', old_value: null, new_value: '2099-01-01', source_url: 'https://example.org', note: 'check' });
    const open = (await store.listSuggestions('open')).find((g) => g.scholarship_id === id);
    if (!open) throw new Error('suggestion not found');
    if ((await store.resolveSuggestion(open.id, 'dismissed')) !== 1) throw new Error('could not resolve suggestion');
  });
  await step('count profiles', () => store.countProfiles());
  if (!id.startsWith('zz-store-check-') || (await store.deleteScholarship(id)) !== 1) throw new Error('could not remove the test row');
  console.log('\nAll good. The temporary test row was removed.');
} catch {
  console.error('\nSomething failed. See the message above.');
} finally {
  store.close();
}
