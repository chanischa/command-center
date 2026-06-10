# Command Center

Personal productivity dashboard — Next.js 14 + Supabase + Vercel.

## Stack

- **Frontend**: Next.js 14 (App Router), TypeScript
- **Database**: Supabase (Postgres + Auth + Real-time)
- **Hosting**: Vercel (free tier)
- **Auth**: Google OAuth + Magic Link email

---

## Setup in 4 steps

### 1. Supabase

1. Go to [supabase.com](https://supabase.com) → New project
2. Open **SQL Editor** → paste the contents of `supabase/schema.sql` → Run
3. Go to **Settings → API** → copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Go to **Authentication → Providers**:
   - Enable **Google** (needs Google Cloud OAuth client — [guide](https://supabase.com/docs/guides/auth/social-login/auth-google))
   - Enable **Email** (magic link, enabled by default)

### 2. Local development

```bash
# Install dependencies
npm install

# Copy env template
cp .env.example .env.local
# Fill in your Supabase URL and anon key

# Run dev server
npm run dev
# Open http://localhost:3000
```

### 3. Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` = your Vercel URL (e.g. `https://command-center.vercel.app`)
4. Click Deploy — done in ~60 seconds

### 4. Connect Apple Calendar

1. Open the deployed app → Today page
2. Tap **Calendar URL** button
3. Follow the in-app instructions to get your `webcal://` link from iPhone
4. Paste and tap **Save & Sync**

---

## Project structure

```
app/
  auth/           Login page + OAuth callback
  today/          Homepage — focus, calendar, tasks, goals
  tasks/          Full task management
  goals/          Long-term goals with milestones
  schedule/       Day timeline view
components/
  AppShell.tsx    Navigation rail + drawer
lib/
  supabase.ts     Browser + server clients
  useTasks.ts     Task CRUD hook
  useGoals.ts     Goals CRUD hook
  useSettings.ts  User settings (calendar URL, venture progress)
  useCalendar.ts  iCal parsing with proxy fallbacks
types/
  database.ts     TypeScript types for all tables
supabase/
  schema.sql      Run this in Supabase SQL editor
```

---

## Features

- **Today page** — focus block, Apple Calendar, tasks, venture progress rings, goals
- **Tasks** — full CRUD with ventures, tags, sub-time windows, priority, due dates
- **Goals** — long-term goals grouped by horizon (3m/6m/1y/3y) with milestone tracking
- **Day schedule** — timeline view with schedule blocks + Apple Calendar overlay
- **Real-time** — tasks and goals sync across devices via Supabase realtime
- **Auth** — Google or magic link email
- **Mobile** — bottom nav, works on iPhone Safari
