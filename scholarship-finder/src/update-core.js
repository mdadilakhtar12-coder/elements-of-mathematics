// The logic of the daily update, without any network calls so it can be tested.
//
// The update asks Claude (with web search) for two things: new scholarships, and changed dates for the
// ones we already list. This module builds the request and then decides what is safe to save:
//   - a new scholarship is saved only as a DRAFT, never published, with no "verified" date;
//   - a changed date is saved only as a SUGGESTION for an admin to apply or dismiss;
//   - nothing that already exists is ever overwritten.
import { validateScholarship, realDate } from '../shared/validate.js';

export const MAX_NEW_PER_RUN = 10;

export const SYSTEM_PROMPT = `You research scholarships for students in Odisha, India, studying in Class 10, 11, 12 or an undergraduate course (including B.Sc).
Use web search. Prefer official government, university and foundation websites. Report only what the pages you read actually say. Never guess: when a detail is not stated, use null (or an empty list) and say so in "notes".
Reply with one JSON object only, in a \`\`\`json fenced block, with no other text after it.`;

const SCHEMA_TEXT = `{
  "new_scholarships": [
    {
      "id": "short-lowercase-id-with-dashes",
      "name": "official scheme name",
      "provider": "who runs it",
      "levels": ["class10" | "class11" | "class12" | "ug"],
      "min_percentage": number or null,
      "categories": ["General" | "OBC" | "SC" | "ST" | "EWS"]   // empty list = all categories
      "gender": "any" | "female" | "male" | "other",
      "state": "All India" | "Odisha",
      "max_income": annual family income limit in rupees, or null,
      "disability_only": true | false,
      "required_groups": ["minority" | "defence" | "bocw" | "vulnerable"],
      "amount": "amount or benefit as stated",
      "start_date": "YYYY-MM-DD" or null,
      "last_date": "YYYY-MM-DD" or null,
      "documents": ["document", ...],
      "apply_steps": ["step", ...],
      "official_link": "https:// official apply page",
      "source_url": "https:// page where you read these details",
      "criteria_note": "extra eligibility rule that the fields above cannot express" or null,
      "notes": "what you could not confirm, and any doubts"
    }
  ],
  "date_changes": [
    {
      "scholarship_id": "id from the list above",
      "field": "last_date" | "start_date",
      "new_value": "YYYY-MM-DD",
      "source_url": "https:// page that states this date",
      "evidence": "one short sentence on what the page says"
    }
  ],
  "summary": "one or two sentences on what you searched"
}`;

// existing: [{ id, name, provider, status, last_date }]
export function buildPrompt({ today, existing }) {
  const list = existing
    .map((s) => `${s.id} | ${s.name} | ${s.provider} | ${s.status} | last date: ${s.last_date ?? 'unknown'}`)
    .join('\n');
  return `Today is ${today}.

Scholarships we already list (id | name | provider | status | last date):
${list}

Task 1 - new scholarships. Find up to ${MAX_NEW_PER_RUN} scholarships that are open now or open within the next 3 months and that a student in Odisha in Class 10, 11, 12 or an undergraduate course could apply for, and that are NOT in the list above. Cover central schemes (National Scholarship Portal and ministries), Odisha government schemes, and private or CSR foundations. Skip anything for students outside India, for postgraduate or PhD students only, or for another state only.

Task 2 - date changes. For scholarships in the list that have no last date, whose last date is within the next 45 days, or whose round has closed, look for the current round's dates. Report a change only when a page clearly states a start or last date for the current cycle and it differs from the list.

Quality rules:
- Dates must be written YYYY-MM-DD. If a source gives only a month or says "expected", use null.
- "official_link" must be the scheme's own official apply or information page, not a news or aggregator site. If you cannot find one, leave the scholarship out.
- "source_url" is the page you actually read.
- Do not repeat a scholarship that is already in the list, even under a slightly different name.
- Include nothing you could not find. An empty list is a good answer.

Answer with this JSON shape:
${SCHEMA_TEXT}`;
}

// Pulls the JSON object out of the model's reply. Prefers the last fenced block.
export function extractJson(text) {
  const fences = [...String(text).matchAll(/```(?:json)?\s*([\s\S]*?)```/g)];
  const candidates = [];
  if (fences.length) candidates.push(fences[fences.length - 1][1]);
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last > first) candidates.push(text.slice(first, last + 1));
  for (const c of candidates) {
    try {
      const obj = JSON.parse(c);
      if (obj && typeof obj === 'object') return obj;
    } catch {
      /* try the next candidate */
    }
  }
  throw new Error('The reply did not contain a JSON object.');
}

export const normName = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');

const slug = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const sameScheme = (a, b) => {
  const x = normName(a);
  const y = normName(b);
  if (!x || !y) return false;
  return x === y || (Math.min(x.length, y.length) >= 12 && (x.includes(y) || y.includes(x)));
};

const asLines = (v) => (Array.isArray(v) ? v.map((x) => String(x)).join('\n') : String(v ?? ''));

// result: parsed model reply. existing: all stored scholarships. openSuggestions: open date suggestions.
// Returns what to save, and why anything was skipped.
export function planChanges({ result, existing, openSuggestions = [], today, model = 'Claude' }) {
  const newDrafts = [];
  const suggestions = [];
  const skipped = [];
  const byId = new Map(existing.map((s) => [s.id, s]));
  const seenIds = new Set();

  for (const item of Array.isArray(result?.new_scholarships) ? result.new_scholarships : []) {
    if (newDrafts.length >= MAX_NEW_PER_RUN) {
      skipped.push({ what: item?.name, why: `more than ${MAX_NEW_PER_RUN} new scholarships in one run` });
      continue;
    }
    const name = String(item?.name ?? '').trim();
    const id = slug(item?.id || name);
    if (!name || !id) {
      skipped.push({ what: name || '(no name)', why: 'missing name' });
      continue;
    }
    if (byId.has(id) || seenIds.has(id) || existing.some((s) => sameScheme(s.name, name))) {
      skipped.push({ what: name, why: 'already in the list' });
      continue;
    }
    if (!/^https:\/\//.test(String(item.official_link ?? ''))) {
      skipped.push({ what: name, why: 'no https official link' });
      continue;
    }
    if (!/^https:\/\//.test(String(item.source_url ?? ''))) {
      skipped.push({ what: name, why: 'no https source link' });
      continue;
    }

    const { value, errors } = validateScholarship({
      ...item,
      id,
      name,
      documents: asLines(item.documents),
      apply_steps: asLines(item.apply_steps),
      status: 'draft',
      last_verified_on: '',
      min_percentage: item.min_percentage ?? '',
      max_income: item.max_income ?? '',
      start_date: item.start_date ?? '',
      last_date: item.last_date ?? '',
    });
    if (errors.length) {
      skipped.push({ what: name, why: errors.join(' ') });
      continue;
    }
    if (!value.levels.length) {
      skipped.push({ what: name, why: 'no class or course level given' });
      continue;
    }

    const note = `Found by the daily update on ${today} (${model}). Not checked on the official site. ${String(item.notes ?? '').trim()}`.trim();
    newDrafts.push({
      ...value,
      status: 'draft', // never published here
      last_verified_on: null,
      verification_note: note.slice(0, 500),
      created_at: new Date().toISOString(),
    });
    seenIds.add(id);
  }

  const known = new Set(openSuggestions.map((g) => `${g.scholarship_id}|${g.field}|${g.new_value}`));
  for (const c of Array.isArray(result?.date_changes) ? result.date_changes : []) {
    const s = byId.get(c?.scholarship_id);
    const key = `${c?.scholarship_id}|${c?.field}|${c?.new_value}`;
    if (!s) {
      skipped.push({ what: String(c?.scholarship_id), why: 'date change for an unknown scholarship' });
    } else if (!['last_date', 'start_date'].includes(c.field)) {
      skipped.push({ what: s.name, why: `cannot suggest a change to "${c.field}"` });
    } else if (!realDate(String(c.new_value ?? ''))) {
      skipped.push({ what: s.name, why: 'the suggested date is not a real YYYY-MM-DD date' });
    } else if (c.new_value === s[c.field]) {
      skipped.push({ what: s.name, why: 'the date is already what we have' });
    } else if (!/^https:\/\//.test(String(c.source_url ?? ''))) {
      skipped.push({ what: s.name, why: 'no https source for the date' });
    } else if (known.has(key)) {
      skipped.push({ what: s.name, why: 'the same suggestion is already open' });
    } else {
      known.add(key);
      suggestions.push({
        scholarship_id: s.id,
        field: c.field,
        old_value: s[c.field] ?? null,
        new_value: c.new_value,
        source_url: c.source_url,
        note: String(c.evidence ?? '').slice(0, 300) || null,
      });
    }
  }

  return { newDrafts, suggestions, skipped };
}
