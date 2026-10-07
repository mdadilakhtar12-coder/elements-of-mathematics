# PageCraft — landing page builder (v0.1, personal use)

Pure HTML/JS, no server, no build step, no cost. Open `index.html` in Chrome
(double-click) or host the folder on any static host.

1. `index.html` – template gallery (5 categories × 5 templates (Education, Salon, Real Estate, Clinic, Fitness))
2. `editor.html?t=<id>` – click-to-edit editor, preview, **Download ZIP**

## What's new (v2)
- **Blank page builder:** start from nothing and add sections (hero, features, pricing, gallery, video, FAQ, map, countdown, …) from a library
- **Many pages in one site:** add pages (blank or from any template), page menu, links between pages, one ZIP for the whole site
- **Drag & drop elements:** heading, text, WhatsApp / Call / Form / Link buttons, image, video, list, divider, space
- **Button & link settings (🔗):** any button can open the enroll popup, WhatsApp, call, an external link / Google Form, another page or a section
- **Image canvas:** upload your own design as the background and drag text, buttons and images anywhere on top (separate phone shape)
- **Custom HTML block** for your own code
- **Image rules shown clearly:** best size per image, formats (JPG, PNG, WebP, GIF, SVG), max 15 MB; every image is auto-compressed (usually < 300 KB)
- **Speed:** lazy-loaded images, minimal HTML, page-weight report, mobile hamburger menu

## What the editor can do
- Edit any text in place (Highlight / Bold on selected words)
- Replace images (upload, drag & drop, URL) – auto-compressed
- YouTube links → thumbnail + in-page player, with test button
- Duplicate / delete / reorder cards; show / hide / reorder sections
- Brand colours, page title & description
- WhatsApp button, Call button (each can be switched off)
- Enroll popup → saves lead to **Google Form** → redirects to webinar link (e.g. webinar.gg)
- Google Maps block (type an address), Before/After slider, optional service dropdown in the popup, mobile bottom bar (Call · WhatsApp · Book)
- Countdown timer + auto-filled event date (IST)
- Meta Pixel / Analytics code box
- Auto-save in the browser; Undo for structure changes
- Export: ZIP with `index.html`, `lb.js`, `assets/` – drag-drop on Netlify Drop etc.

## Add a template
Copy `templates/edu-aurora.js`, change `id`, register it in `index.html` and
`editor.html`. Mark editable things with `data-e` (text), `data-img="key"`,
`data-video`, `data-list` (repeatable group), `data-section="Name"`,
`data-cta="enroll|whatsapp|call"`, `data-countdown`, `data-acc` (accordion).

## Next categories
More categories: add templates in templates/ and run python3 sync_scripts.py.
