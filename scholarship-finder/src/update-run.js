// Runs one daily update: asks Claude (with web search) for new scholarships and changed dates, then saves
// only drafts and suggestions. The Claude client is passed in, so tests can use a fake one.
import { SYSTEM_PROMPT, buildPrompt, extractJson, planChanges } from './update-core.js';

const MAX_CONTINUATIONS = 6;

// Calls the API until the answer is complete. Long web searches can pause the turn
// (stop_reason "pause_turn"); the paused content is sent back and the server carries on.
export async function askClaude({ client, model, prompt }) {
  const usage = { input_tokens: 0, output_tokens: 0, web_searches: 0 };
  const content = [];
  for (let turn = 0; turn <= MAX_CONTINUATIONS; turn++) {
    const messages = [{ role: 'user', content: prompt }];
    if (content.length) messages.push({ role: 'assistant', content });

    const stream = client.messages.stream({
      model,
      max_tokens: 32000,
      system: SYSTEM_PROMPT,
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 30 }],
      output_config: { effort: 'medium' },
      messages,
    });
    const msg = await stream.finalMessage();

    usage.input_tokens += msg.usage?.input_tokens ?? 0;
    usage.output_tokens += msg.usage?.output_tokens ?? 0;
    usage.web_searches += msg.usage?.server_tool_use?.web_search_requests ?? 0;
    content.push(...msg.content);

    if (msg.stop_reason === 'pause_turn') continue;
    if (msg.stop_reason === 'refusal') throw new Error('The model declined this request.');
    if (msg.stop_reason === 'max_tokens') throw new Error('The answer was cut off (max_tokens). Try again or lower the number of scholarships.');
    const text = content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
    return { text, usage };
  }
  throw new Error(`The search did not finish after ${MAX_CONTINUATIONS} continuations.`);
}

export async function runUpdate({ store, client, model, today, dryRun = false, log = console.log }) {
  const existing = await store.listAll();
  const openSuggestions = await store.listSuggestions('open');
  const prompt = buildPrompt({ today, existing });

  log(`Asking ${model} to search (${existing.length} scholarships already listed)...`);
  const { text, usage } = await askClaude({ client, model, prompt });
  log(`Done: ${usage.web_searches} web searches, ${usage.input_tokens} input and ${usage.output_tokens} output tokens.`);

  const result = extractJson(text);
  const plan = planChanges({ result, existing, openSuggestions, today, model });

  const saved = { drafts: 0, suggestions: 0 };
  if (!dryRun) {
    for (const draft of plan.newDrafts) {
      // Last check right before writing: never touch a scholarship that already exists.
      if (await store.get(draft.id)) {
        plan.skipped.push({ what: draft.name, why: 'already exists (added while the update ran)' });
        continue;
      }
      await store.save({ ...draft, status: 'draft' });
      saved.drafts += 1;
    }
    for (const s of plan.suggestions) {
      await store.addSuggestion(s);
      saved.suggestions += 1;
    }
  }

  log(`${dryRun ? 'Would save' : 'Saved'} ${dryRun ? plan.newDrafts.length : saved.drafts} new draft(s) and ${dryRun ? plan.suggestions.length : saved.suggestions} date suggestion(s).`);
  for (const d of plan.newDrafts) log(`  + draft: ${d.name} (${d.id})`);
  for (const s of plan.suggestions) log(`  ~ ${s.scholarship_id}: ${s.field} ${s.old_value ?? 'none'} -> ${s.new_value}`);
  for (const k of plan.skipped) log(`  - skipped: ${k.what} (${k.why})`);
  if (result.summary) log(`Summary: ${result.summary}`);
  return { plan, saved, usage };
}
