# Oscars Ballot 2026

A mobile-first digital Oscars ballot for watch parties. Create a room, share the link, and compete on predictions as awards are announced in real time.

## Features

- **Create a ballot** – Name your room and get a shareable link
- **Join via link** – No account needed; enter your name and make predictions
- **23 Oscar categories** – All Academy Award categories included
- **Real-time leaderboard** – Track scores as results are entered
- **Admin results entry** – Enter winners as they're announced (platform admin)

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and create a ballot.

## Modes

### Local mode (default)

Without Supabase configured, the app runs in **local-only mode**:
- Rooms and ballots are stored in `localStorage`
- Works for single-device use or when everyone shares one browser
- Admin results are stored locally

### Supabase mode (multi-device real-time)

1. Create a project at [supabase.com](https://supabase.com)
2. Run the schema in the SQL editor: `supabase/schema.sql`
3. Create `.env` with:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Restart the dev server

With Supabase, rooms sync across devices and the leaderboard updates in real time.

## Updating nominees

Edit `src/data/categories.js` when the 2026 nominees are announced (typically January 2026). Replace the placeholder names with the actual nominees.

## Ceremony lock

Ballots lock when the ceremony starts. The default is March 8, 2026, 4:00 PM PT. Update `CEREMONY_START` in `src/data/categories.js` if needed.
