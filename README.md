# DWC-website

Website for the Dutch Whovian Community: Vite + React + TypeScript + Tailwind v4, with a small Express server (`server/app.ts`) that stores the page text and serves the admin dashboard API. It runs as a normal Node server locally and as a Vercel Function on Vercel.

## Getting started

```bash
npm install
cp .env.example .env   # set ADMIN_PASSWORD
npm run dev            # site on http://localhost:5173, API on :3001
```

- Website: `http://localhost:5173/` (home), `/contact` and `/privacy-policy` are separate pages
- Admin dashboard: `http://localhost:5173/admin` (or the person icon in the header)

## How content works

- All text on the page is defined by `SiteContent` in `src/content/types.ts`; the defaults (from the Stitch design) are in `src/content/defaults.ts`.
- Edits from the dashboard are saved by the server: locally in `server/content.json` (not in git; delete it to go back to the defaults), on Vercel as `content.json` in the Vercel Blob store.
- The server validates every save against the shape of the defaults (`src/content/schema.ts`), so new fields added to the defaults show up automatically for existing content.

## Images

Admins can upload images (max 4 MB, the Vercel Functions request limit) for news cards, events, team photos and the history block. Files are stored under random names in `server/uploads/` locally (not in git) or under `uploads/` in Vercel Blob, and are always served via `/uploads/…`; images no longer used are removed automatically a day after they were replaced.

## Security

- Admin password from `.env`; login is rate limited (10 failed attempts per IP per 15 minutes). Use a long password in production.
- Sessions are signed tokens (HMAC-SHA256 with `SESSION_SECRET` and the password, 8 hours), so they work across serverless instances. Changing `ADMIN_PASSWORD` or `SESSION_SECRET` logs everyone out.
- On Vercel the failed-login limit is kept per function instance, so it is best-effort; add a Vercel Firewall rate limit rule on `/api/login` for a strict limit.
- Every save is validated: fixed content shape, length limits, links only `#…`, `/…`, `https://…`, `mailto:` or `tel:` (no `javascript:`), images only from `/uploads/`.
- Uploads: max 4 MB, type is checked from the file bytes (JPG, PNG, WebP, GIF only — no SVG), stored under a random name.
- All text is rendered by React as plain text, so HTML in content can't run.
- Security headers via helmet, including a strict Content-Security-Policy (no inline scripts, no third-party scripts, no framing).
- No third-party requests: fonts (Outfit, Inter via `@fontsource`) and icons (`src/assets/fonts/`, a static weight-400 cut of Material Symbols) are served by the site itself, so no visitor data goes to Google.

## Deploying on Vercel

Pushing to GitHub deploys automatically when the repo is connected to a Vercel project. `vercel.json` makes Vercel run `npm run build:vercel`, which builds the site and writes `.vercel/output` (Build Output API): the static site, plus one function that runs the Express app for `/api/*` and `/uploads/*`. The function is bundled with esbuild by `scripts/build-vercel.ts`; static pages get the same security headers as the server.

One-time setup in the Vercel dashboard:

1. **Storage → Create → Blob** (private), and connect it to this project for all environments. This adds `BLOB_READ_WRITE_TOKEN`. (For a public store also set `BLOB_ACCESS=public`.)
2. **Settings → Environment Variables**, for Production and Preview:
   - `ADMIN_PASSWORD`: a long, unique password
   - `SESSION_SECRET`: a random string, e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. Redeploy (environment variables only apply to new deployments).

Production and preview deployments share the same Blob store, so saving in the admin of a preview changes the live site too.

## Production on your own server

```bash
npm run build
npm start              # Express serves dist/ + /api on $PORT (default 3001)
```

Host it somewhere that runs Node and keeps files on disk (VPS, Render with a disk, Railway volume…), so `server/content.json` and `server/uploads/` survive restarts and deploys. Serve it over HTTPS; behind a reverse proxy set `TRUST_PROXY=1`. To try the production build locally over plain http use `FORCE_HTTPS=0 npm start`.

## Design source

`stitch_dutch_whovian_community_hub/` holds the original Stitch export (`dutch_whovian_community_home/code.html`) and the Nebula Space design tokens.
