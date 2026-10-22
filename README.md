# DWC-website

Website for the Dutch Whovian Community: Vite + React + TypeScript + Tailwind v4, with a small Express server that stores the page text and serves the admin dashboard API.

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
- Edits from the dashboard are saved by the server in `server/content.json` (not in git). Delete that file to go back to the defaults.
- The server validates every save against the shape of the defaults (`src/content/schema.ts`), so new fields added to the defaults show up automatically for existing content.

## Images

Admins can upload images for news cards, events, team photos and the history block. Files are stored in `server/uploads/` (not in git) under random names; images no longer used are removed automatically a day after they were replaced.

## Security

- Admin password from `.env`; login is rate limited (10 failed attempts per IP per 15 minutes). Use a long password in production.
- Sessions are random 256-bit tokens kept in server memory (8 hours).
- Every save is validated: fixed content shape, length limits, links only `#…`, `/…`, `https://…`, `mailto:` or `tel:` (no `javascript:`), images only from `/uploads/`.
- Uploads: max 5 MB, type is checked from the file bytes (JPG, PNG, WebP, GIF only — no SVG), stored under a random name.
- All text is rendered by React as plain text, so HTML in content can't run.
- Security headers via helmet, including a strict Content-Security-Policy (no inline scripts, no third-party scripts, no framing).
- No third-party requests: fonts (Outfit, Inter via `@fontsource`) and icons (`src/assets/fonts/`, a static weight-400 cut of Material Symbols) are served by the site itself, so no visitor data goes to Google.

## Production

```bash
npm run build
npm start              # Express serves dist/ + /api on $PORT (default 3001)
```

Host it somewhere that runs Node and keeps files on disk (VPS, Render with a disk, Railway volume…), so `server/content.json` and `server/uploads/` survive restarts and deploys. Serve it over HTTPS; behind a reverse proxy set `TRUST_PROXY=1`. To try the production build locally over plain http use `FORCE_HTTPS=0 npm start`.

## Design source

`stitch_dutch_whovian_community_hub/` holds the original Stitch export (`dutch_whovian_community_home/code.html`) and the Nebula Space design tokens.
