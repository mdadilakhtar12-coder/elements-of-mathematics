# Scholarship Finder

A mobile-first website that also installs as an app (PWA). Students of Odisha (Class 10 to UG) fill a short form and see the scholarships they may be eligible for, with deadlines and official apply links.

**Status: prototype.** Done: student form, matching, cards, detail page, days-left counter, Closing soon filter, Newly added tag, PWA install and offline shell, seed data (7 entries, 2 published).
Not yet built: admin panel, review queue, daily update script, MCP server. See "Next steps".

## Run it locally

Requires Node 22.13 or newer (uses the built-in `node:sqlite`, so there are no npm dependencies).

```bash
cd scholarship-finder
npm test          # matching and date rules
npm run seed      # load seed/scholarships.json into data/scholarships.db
npm start         # http://localhost:3000
```

Open the page on a phone (same Wi-Fi, use your computer's IP) or in Chrome's device mode. On Android Chrome, use the menu → "Install app".

`npm run seed -- --replace` clears the table first. Without it, existing rows are updated by `id`.

## How it works

- `shared/eligibility.js`: matching rules, days left, and the "is this still open" check. Used by the server and the browser, so both agree.
- `server.js`: `POST /api/match` returns eligible, open scholarships. `GET /api/scholarships/:id` returns one. Nothing that is a draft, expired, or lacks an official link is returned.
- `src/db.js`: SQLite schema, seeding, and queries. Lists and arrays are stored as JSON text.
- `public/`: the page (plain JavaScript, no framework), styles, manifest, service worker, and icon.

Rules to know:

- **Days left is never stored.** It is computed from `last_date` in India time (Asia/Kolkata) on every request and again in the browser.
- **Expired items are hidden automatically** (last date before today).
- **Missing profile values never exclude a scholarship.** If a student skips "marks", the marks rule is not applied. Results may therefore include items the student does not qualify for, so eligibility shown is "may be eligible".
- **Every card and detail page** shows "Please confirm on the official website before applying" and the "last verified" date.

## Seed data: please review before publishing

`seed/scholarships.json` has 7 entries:

| Status | Entries | Notes |
|---|---|---|
| published | NSP Post Matric (SC), PM YASASVI (OBC) | Dates come from secondary news sources that cite the portal. Not yet checked on the official notice. |
| draft | NSP Post Matric (ST), Odisha Post Matric, CSSS (college), INSPIRE SHE, AICTE Pragati (girls) | Hidden until verified. Each has a `verification_note` saying what is unknown. |

Sources disagree on several deadlines (for example, 30 Sep or 31 Oct 2026 for the college scheme). I could not open official government pages from this environment, so every date and amount needs checking on the official site before the entry is marked published. The target of 30–40 scholarships is not reached yet.

To publish an entry, set `"status": "published"` and `"last_verified_on"` to the date you checked it, then run `npm run seed`.

## Deploy (free options)

The app is a single Node process with a SQLite file. Hosting matters because the free tiers differ in how they keep files:

- **Render (free web service):** easiest. The disk is wiped on each deploy and when the service sleeps, so the database would reset. Fine for this prototype only if you re-run `npm run seed` on start.
- **Fly.io / Railway:** a persistent volume keeps the database, but may need a paid plan or card.
- **Supabase (free tier) + this app on Render:** the durable option. Moving to Supabase means replacing `src/db.js`. I recommend this before the admin panel is added.

Render settings for the prototype:

- Build command: `npm install` (nothing to install, but harmless)
- Start command: `node scripts/seed.js && node server.js`
- Node version: 22 (set the `NODE_VERSION` environment variable to `22`)

## Connect the MCP server to Claude

Not built yet. It will come after the admin panel and update script.

## Next steps

1. Verify the 7 seed entries on official sites and add the rest of the 30–40 list.
2. Admin panel (password-protected): add, edit, approve, review queue for drafts.
3. Daily update script: searches official sources, saves drafts only, sets `source_url` and `last_verified_on`. Never publishes on its own.
4. MCP server with the tools you listed: `list_scholarships`, `add_scholarship`, `update_scholarship`, `mark_expired`, `list_closing_soon`, `list_drafts`, `publish_draft`.
5. Hindi and Odia: move labels into translation files. The data fields are already in English.
