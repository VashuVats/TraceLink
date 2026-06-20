# TraceLink — Missing Person OSINT Intelligence Platform

A single Next.js 15 app (no separate backend service) that helps investigators
create missing-person cases, run OSINT scans, score leads with AI, plot
everything on a map, and generate a printable bulletin — built for a
24–48 hour hackathon, solo-dev friendly.

## Why one app instead of Next.js + FastAPI

The original spec called for a separate FastAPI backend. For a solo build in
a hackathon window, that's two services, two languages, and a CORS story to
debug under time pressure for no real benefit — Next.js API routes do the
same job. Every "service" from the original spec still exists, just as
TypeScript modules:

| Original spec            | This build                          |
|---------------------------|--------------------------------------|
| `osint_service.py`        | `lib/osint_service.ts`               |
| `ai_service.py`           | `lib/ai_service.ts`                  |
| `bulletin_service.py`     | `lib/bulletin.ts`                    |
| FastAPI routes            | `app/api/**/route.ts`                |
| SQLAlchemy models          | `supabase/schema.sql` + `lib/types.ts` |

## 1. Set up Supabase (5 min)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor → paste the contents of `supabase/schema.sql` → run.
   This creates the three tables, permissive demo RLS policies, and one
   seeded case so the dashboard isn't empty on first load.
3. Project Settings → API → copy the URL, `anon` key, and `service_role` key.

## 2. Configure environment

```bash
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, and (optionally) GEMINI_API_KEY
```

Get a free Gemini key at https://aistudio.google.com/apikey. If you skip
this, the three AI features still work — they fall back to deterministic
local logic (extractive summary, keyword-overlap scoring, a template
bulletin) so the app never breaks mid-demo for lack of a key.

## 3. Install and run

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

## What's real vs. sample data (be upfront about this with judges)

- **News search is live** — it queries Google News' public RSS feed
  (no API key needed) for `name + last seen location + "missing"`.
- **Social search is sample data**, clearly labeled `(sample)` in the UI.
  Live social-platform search needs paid/restricted APIs and raises real
  privacy concerns when scraping posts about named individuals — not
  something to fake past judges or build for real in a hackathon. The
  function is isolated in `lib/osint_service.ts:searchSocial()` so it's a
  clean swap-in later if you get API access.
- **AI scoring and bulletin text** call Gemini live if `GEMINI_API_KEY` is
  set; otherwise they use the documented fallback logic above.

## Demo tips

- Use the seeded "Avery Morgan" case (or create your own) and click
  **Run OSINT Scan** on the case detail page — it's the centerpiece feature.
- Don't depend on venue wifi for the live news fetch during judging; if it's
  flaky, run a scan beforehand so leads are already saved, then do a second
  scan live as a bonus.
- **Generate Bulletin** downloads a real PDF — good to show on a projector.

## Project structure

```
app/
  page.tsx                  Dashboard
  case/new/page.tsx         Create case form
  case/[id]/page.tsx        Case detail (photo, summary, OSINT, map, timeline)
  leads/page.tsx            Cross-case lead table
  tips/page.tsx             Public citizen tip portal
  map/page.tsx              Full map intelligence view
  api/
    cases/route.ts                  POST create / GET list
    cases/[id]/route.ts             GET single / PATCH update
    cases/[id]/scan/route.ts        POST run OSINT + AI scoring
    cases/[id]/bulletin/route.ts    POST -> PDF
    tips/route.ts                   POST create / GET list
    leads/route.ts                  GET cross-case leads
    stats/route.ts                  GET dashboard counts
components/        UI primitives + page-level client components
lib/
  osint_service.ts   News (real RSS) + social (sample) search
  ai_service.ts       Gemini calls: summary, scoring, bulletin text
  bulletin.ts          PDF generation (pdf-lib)
  data.ts              Server-side Supabase read helpers
supabase/schema.sql    Tables + RLS + seed case
```

## Known cuts (intentional, for time)

- No auth/login — anyone with the URL can create cases or scan. Fine for a
  demo; add Supabase Auth + per-role RLS before any real use.
- No tests.
- Map photo upload isn't wired to storage — `photo_url` takes a direct
  image URL for now (paste one when creating a case).

## Deploying

Push to GitHub, import into Vercel, add the same env vars there. Vercel's
build environment has full internet access, so the live Google News RSS
fetch will work in production even if it's flaky in a sandboxed dev setup.
