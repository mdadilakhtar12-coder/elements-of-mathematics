# Scholarship Finder

A mobile-first website that also installs as an app (PWA). Students of Odisha (Class 10 to UG) fill a short form and see the scholarships they may be eligible for, with deadlines and official apply links.

**Status: prototype.** Done: student form (contact, school/college, class/stream, B.Sc Honours and Minor), matching, cards, detail page, days-left counter, Closing soon filter, Newly added tag, PWA install and offline shell, admin panel with password login, review queue, student list with CSV export, seed data (30 scholarships, 2 published and 28 drafts to verify).
Not yet built: daily update script and MCP server. The drafts still need to be verified on the official sites. See "Next steps".

## Run it locally

Requires Node 22.13 or newer (uses the built-in `node:sqlite`, so there are no npm dependencies).

```bash
cd scholarship-finder
npm test          # matching and date rules
npm run seed      # load seed/scholarships.json into data/scholarships.db
npm start         # http://localhost:3000
```

Open the page on a phone (same Wi-Fi, use your computer's IP) or in Chrome's device mode. On Android Chrome, use the menu → "Install app".

`npm run seed -- --replace` clears the table first.

### Admin panel

1. Set a password on the server (never commit it):
   ```bash
   ADMIN_PASSWORD='choose-a-long-password' npm start
   ```
   Without `ADMIN_PASSWORD` the admin pages stay off.
2. Open `/admin`, log in, and:
   - **Review queue**: drafts are listed first. "Publish" re-runs the checks. A scholarship cannot be published unless it has an https official link, a last date, a verified date, documents, apply steps and an amount.
   - **Add / edit**: all fields are on one form. Lists (documents, steps) are one item per line.
   - **Student profiles**: only students who ticked the consent box. Download as CSV. Formula-like cells are neutralised for spreadsheets.

Security: passwords are compared in constant time. Five wrong attempts block an IP for 15 minutes. The session cookie is HttpOnly and SameSite=Strict, and expires after 8 hours. Restarting the server logs everyone out. Cross-site form posts are blocked.

Note: the login limiter keys on the first `X-Forwarded-For` address. If the host does not set that header, all users share one limit. Without it, existing rows are updated by `id`.

## How it works

- `shared/eligibility.js`: matching rules, days left, and the "is this still open" check. Used by the server and the browser, so both agree.
- `server.js`: `POST /api/match` returns eligible, open scholarships. `GET /api/scholarships/:id` returns one. Nothing that is a draft, expired, or lacks an official link is returned.
- `src/db.js`: SQLite schema, seeding, and queries. Lists and arrays are stored as JSON text.
- `public/`: the page (plain JavaScript, no framework), styles, manifest, service worker, and icon.

Rules to know:

- **Days left is never stored.** It is computed from `last_date` in India time (Asia/Kolkata) on every request and again in the browser.
- **Expired items are hidden automatically** (last date before today).
- **Missing profile values never exclude a scholarship.** If a student skips "marks", the marks rule is not applied. Results may therefore include items the student does not qualify for, so eligibility shown is "may be eligible".
- **Student details** are saved only with consent. The form collects name, mobile, email, school/college, class or course (B.Sc students also give Honours and Minor subjects), marks, category, gender, state, income and disability. The server checks all of it. Phone and email are personal data: show a privacy notice before going live and decide how long to keep them.
- **Every card and detail page** shows "Please confirm on the official website before applying" and the "last verified" date.

## Seed data: 30 scholarships, 28 of them drafts

`seed/scholarships.json` holds 30 scholarships: central schemes on the National Scholarship Portal (SC, ST, OBC/YASASVI, EBC, minorities, disability, CSSS, higher education for SC/ST, AICTE Pragati and Saksham, ex-servicemen wards, INSPIRE), Odisha state schemes (post-matric SC/ST/OBC, pre-matric, e-Medhabruti, Junior Merit, Gopabandhu, Banishree, Nirman Shramik and others) and private ones (Vidyadhan Odisha, HDFC Parivartan, SBI Asha, Reliance Foundation).

I could not open government sites from the build environment, so every detail comes from search results and secondary sites. For that reason:

- Only 2 are **published** (the two with the most consistent sources). The other 28 are **drafts**, hidden from students.
- Each entry has a `source_url` (where the details were found) and a `verification_note` that says exactly what to confirm (income limit, amount, date, and where sources disagreed).
- Entries with no confirmed date have no last date, so the admin panel will not let you publish them until you add it.
- Some drafts are for rounds that already closed (HDFC, SBI, Reliance, Nirman Shramik). They are kept so you can update the date when the next round opens.

**To publish one:** open `/admin`, pick it from the Review queue, open its official link, check the notes against the official page, fix any field that differs, enter today's date as "last verified", set status to Published and save (or use the Publish button when nothing needs changing).

Restarting the server adds any new entries from the seed file but never overwrites a row that already exists, so your edits and publishing survive. `npm run seed -- --update` overwrites rows from the file.

### Groups

Some schemes are only for a group the form can't guess from category or income: notified minority communities, children of ex-servicemen or CAPF personnel, children of registered construction workers, and vulnerable families. The student ticks the groups that apply, and a scheme limited to a group is shown only to those students. Admins set the groups on the scholarship form.

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

1. Verify the 28 draft scholarships on the official sites and publish them from the admin panel.
2. Admin panel (password-protected): add, edit, approve, review queue for drafts.
3. Daily update script: searches official sources, saves drafts only, sets `source_url` and `last_verified_on`. Never publishes on its own.
4. MCP server with the tools you listed: `list_scholarships`, `add_scholarship`, `update_scholarship`, `mark_expired`, `list_closing_soon`, `list_drafts`, `publish_draft`.
5. Hindi and Odia: move labels into translation files. The data fields are already in English.
