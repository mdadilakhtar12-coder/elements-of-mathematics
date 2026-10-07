# Deploy PageCraft (no server needed)

PageCraft is plain HTML/JS, so any static host works. Upload the whole
`landing-builder` folder (keep the folder structure).

## Easiest: Netlify Drop (free, 1 minute)
1. Open https://app.netlify.com/drop (log in once).
2. Drag the **landing-builder** folder onto the page.
3. You get a live link. `index.html` is the template gallery.
4. Optional: add your own domain in Site settings → Domain management.

## Alternatives
- **Cloudflare Pages**: Create project → Upload assets → drop the folder.
- **GitHub Pages**: push the folder to a repo, Settings → Pages → deploy from branch, folder `/landing-builder` (or move the files to the repo root).
- **Any hosting (cPanel etc.)**: upload the folder contents into `public_html`.

## After deploying
- Open `https://your-site/` → pick a template → edit → **Download ZIP**.
- Users' work is saved in their own browser (localStorage), not on your server.
- Videos play from YouTube, forms go to the user's own Google Form, so there is no backend cost.

## Before going commercial (later)
- Add login + saving projects on a server (Firebase / Supabase).
- Add hosting-for-users (publish with one click) and payments.
- Replace placeholder images with real photos and review all sample text.
