# Scholarship Finder

A mobile-first website that also installs as an app (PWA). Students of Odisha (Class 10 to UG) fill a short form and see the scholarships they may be eligible for, with deadlines and official apply links.

**Status:** student site, admin panel, privacy notice, Supabase storage, and the daily update are built. Still to do: the MCP server, and verifying the draft scholarships on official sites.

## What is where

| What | Where |
|---|---|
| Student site | `https://<your-site>/` |
| **Admin panel** | `https://<your-site>/admin` (locally: `http://localhost:3000/admin`) |
| Privacy notice | `https://<your-site>/privacy` |

The admin panel is part of the same app. There is no separate link. Once the site is deployed, add `/admin` to its address and log in with the password you set in `ADMIN_PASSWORD`.

## Run it locally

Requires Node 22.13 or newer.

```bash
cd scholarship-finder
npm install
npm test
ADMIN_PASSWORD='choose-a-long-password' npm start   # http://localhost:3000
```

Locally the data is kept in a SQLite file (`data/scholarships.db`). On a server with Supabase set up it is kept in Supabase (see Deploy).

## Deploy (free): Supabase for data + Render for the website

You need two free accounts: **Supabase** (the database) and **Render** (runs the website). The app is on GitHub already.

### 1. Supabase (the database)

1. Create a project in Supabase. Pick a region near India (for example Mumbai) and note the database password.
2. Open **SQL Editor → New query**, paste the whole of `supabase/schema.sql`, and press **Run**. This creates the tables and locks them so that only the server can read them.
3. Open **Project Settings → API**. Copy two things:
   - **Project URL** (looks like `https://abcd1234.supabase.co`) → this is `SUPABASE_URL`.
   - **service_role key** (under "Project API keys", click Reveal) → this is `SUPABASE_SERVICE_KEY`.

The service_role key is a secret: it can read everything, including student phone numbers. Never put it in the repo, in a chat, or in the browser. Only paste it into the host's environment variable fields.

### 2. Render (the website)

1. In Render choose **New → Blueprint**, connect the GitHub repository, and select the branch to deploy. Render reads `render.yaml` at the top of the repo.
2. When it asks for the secret values, fill them in:

| Variable | What to put |
|---|---|
| `ADMIN_PASSWORD` | The password you will use at `/admin`. Long and not used elsewhere. |
| `SUPABASE_URL` | The Project URL from step 1. |
| `SUPABASE_SERVICE_KEY` | The service_role key from step 1. |
| `ORG_NAME` | Your name or organisation, shown in the privacy notice. |
| `CONTACT_EMAIL` | An email students can write to about their data. |

   You can change these later in the Render dashboard under **Environment**; Render restarts the site when you save.
3. Open the site address Render gives you. Check `/api/health`: it should say `"store":"supabase"`. If it says `sqlite`, the two Supabase variables are not set.
4. Open `/admin` and log in.

The first start copies the seed scholarships (28 drafts and 2 published) into Supabase. Render's free plan puts the site to sleep when idle, so the first visit after a quiet period takes about a minute.

To test the database connection from your own computer: `SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npm run check-store`. It writes one temporary draft, reads it back, and deletes it.

## Verifying the drafts (admin panel)

`seed/scholarships.json` holds 30 scholarships. Only 2 are published. The other 28 are **drafts**, hidden from students, because their details come from search results and secondary sites and have not been checked on official pages.

1. Log in at `/admin`. The **Review queue** lists the drafts.
2. Open one. Click its official link and compare the page with the form and the **verification note**, which says what to confirm (income limit, amount, dates, where sources disagreed).
3. Fix anything that differs. Enter the last date if it is empty.
4. Enter today's date as **last verified**, set the status to **Published**, and save. (The **Publish** button in the list works when nothing needs changing.)

A scholarship cannot be published without an https official link, a last date, a verified date, documents, apply steps, an amount and at least one class level.

## Daily update

`npm run update` asks Claude, with web search, for (1) new scholarships for Odisha students and (2) changed dates for the ones listed. It saves:

- **New scholarships as drafts only**, with `source_url` and a note, never published and never marked verified.
- **Date changes as suggestions**. They appear on the admin dashboard under **Suggested changes**; you open the source, then **Apply** or **Dismiss**. Nothing existing is overwritten.

Try it without saving anything: `ANTHROPIC_API_KEY=... npm run update:dry`.

### Run it every day (GitHub Actions)

The file `.github/workflows/scholarship-update.yml` runs it daily at 04:00 India time, and also checks the database and deletes old student profiles. In the GitHub repository open **Settings → Secrets and variables → Actions → New repository secret** and add:

- `ANTHROPIC_API_KEY`: a key from console.anthropic.com. Each run uses web search and a large model, so it costs money. Set a spending limit in the Anthropic console first. To use a cheaper model, add a repository *variable* (Settings → Secrets and variables → Actions → Variables) named `UPDATE_MODEL`, for example `claude-sonnet-5-5`. `RETENTION_MONTHS` can be set the same way.
- `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`: the same values as for Render.

You can run it by hand from the **Actions** tab (**Run workflow**). A failed run shows red there.

## Student details and privacy

Student details are saved only if the student ticks the consent box. The server checks every field. The admin panel lets you download them as CSV, delete one profile, or delete everything older than `RETENTION_MONTHS` (default 12, set it as an environment variable). The daily workflow does that purge too. The privacy notice at `/privacy` promises that period, so keep the two in step.

The notice is written in plain language and is not legal advice. Many students are under 18. India's data protection law has special rules for children's data, including parental consent. Have someone qualified review the notice and the consent wording before you launch.

## How it works

- `shared/eligibility.js`: matching rules, days left, and the "is this still open" check. Used by the server and the browser.
- `shared/validate.js`: validation for student details and for scholarships.
- `server.js`: `POST /api/match`, `GET /api/scholarships/:id`, `POST /api/profile`, `/privacy`, `/admin`.
- `src/store.js` and `src/store-sqlite.js`: storage. Supabase (over its REST API, no extra package) or SQLite.
- `src/admin.js`, `src/auth.js`: the admin panel and password login.
- `src/update-core.js`, `src/update-run.js`, `scripts/update.js`: the daily update.

Rules to know:

- **Days left is never stored.** It is computed from the last date in India time on every request and again in the browser.
- **Expired items are hidden automatically.** Drafts and items without an official link never reach students.
- **Missing answers never exclude a scholarship.** If a student skips "marks", the marks rule is not applied.
- **Groups.** Schemes for minority communities, children of ex-servicemen or CAPF, registered construction workers, or vulnerable families are shown only to students who tick that group.
- **Every card and detail page** shows "Please confirm on the official website before applying" and the last verified date.

Admin security: passwords are compared in constant time; five wrong attempts block an address for 15 minutes; the session cookie is HttpOnly and SameSite=Strict and lasts 8 hours (restarting the server logs everyone out); cross-site form posts are blocked.

## Environment variables

| Variable | Used for |
|---|---|
| `ADMIN_PASSWORD` | Admin login. The admin panel is off without it. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | Store data in Supabase. Without them a local SQLite file is used. |
| `ORG_NAME`, `CONTACT_EMAIL` | Shown in the privacy notice. |
| `RETENTION_MONTHS` | How long student details are kept (default 12). |
| `ANTHROPIC_API_KEY` | Daily update only. |
| `UPDATE_MODEL` | Daily update only. Default `claude-opus-5-5`. |
| `NODE_ENV=production` | Makes the admin cookie `Secure`. |
| `DB_PATH` | Where the SQLite file lives (local use). |

## Connect the MCP server to Claude

Not built yet. It will let you say "update today's scholarships" to Claude and have it list, add, update, mark expired and publish scholarships through this app.

## Next steps

1. Verify the 28 drafts on the official sites and publish them.
2. Legal review of the privacy notice and consent wording.
3. MCP server (`list_scholarships`, `add_scholarship`, `update_scholarship`, `mark_expired`, `list_closing_soon`, `list_drafts`, `publish_draft`).
4. Hindi and Odia: move labels into translation files. The data fields are already in English.
