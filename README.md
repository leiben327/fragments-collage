# Fragments

**Local-first public MVP** — no login, no payment, no cloud database. Collages and **Community Fragments** stay in the browser (**IndexedDB** for PNGs and metadata; **localStorage** for soft reaction toggles on the wall).

Features: **Random Fragment Challenge**, **Mood Collage Studio** (upload 3–8 images), **generate / shuffle layout**, **download PNG**, **share to Community Fragments** (same device), **PWA** (install to home screen).

## Run locally

```bash
npm install
npm run build   # optional sanity check
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional: copy `.env.example` → `.env.local` and set `NEXT_PUBLIC_SITE_URL` when you want correct Open Graph URLs (not required for local use).

## GitHub

1. Create a new empty repository on GitHub.
2. From this project folder:

```bash
git init
git add .
git commit -m "Initial Fragments MVP"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

(If the repo already exists, skip `git init` and use your existing remote.)

## Deploy on Vercel

1. Import the GitHub repo in [Vercel](https://vercel.com) → **Add New Project**.
2. Framework: **Next.js** (auto-detected). Build command: `npm run build`, install: `npm install`.
3. **Environment variables** (optional): `NEXT_PUBLIC_SITE_URL` = your production URL (e.g. `https://fragments-xxx.vercel.app`).
4. Deploy. No database or Supabase variables are required for this prototype.

## PWA (phone install)

- Manifest: `app/manifest.ts` → `/manifest.webmanifest`
- Icons: `app/icon.tsx`, `app/apple-icon.tsx`
- Service worker: `public/sw.js` (registered in production via `ServiceWorkerRegister` in `app/layout.tsx`)
- Safe areas / viewport: `app/layout.tsx` + `app/page.tsx`

## Future backend (not wired)

Optional SQL reference for a later Supabase (or other) backend: **`docs/FUTURE_SUPABASE.sql`**. The app does **not** load or call it.

## Scripts

| Command        | Description           |
|----------------|-----------------------|
| `npm run dev`  | Development server    |
| `npm run build`| Production build      |
| `npm run start`| Production server     |
| `npm run lint` | ESLint                |

## Stack

Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion, IndexedDB, `modern-screenshot` for export.
