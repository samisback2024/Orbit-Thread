# Voxen — Think Louder, Together.

A full-stack real-time discussion platform built with React, Supabase, and Vercel.  
Users create "Circles" (rooms), have real-time conversations, connect with others, and unlock premium features with a Verified badge.

---

## Table of Contents

1. [Live URL](#live-url)
2. [Tech Stack](#tech-stack)
3. [Architecture Overview](#architecture-overview)
4. [Project Structure](#project-structure)
5. [Design System](#design-system)
6. [Features (Phase 1 — Complete)](#features-phase-1--complete)
7. [Database Schema](#database-schema)
8. [Authentication Flow](#authentication-flow)
9. [Real-Time Messaging](#real-time-messaging)
10. [Environment Variables](#environment-variables)
11. [Local Development](#local-development)
12. [Deployment](#deployment)
13. [Phase 2 Roadmap](#phase-2-roadmap)
14. [Known Limitations](#known-limitations)

---

## Live URL

**Production:** Deployed on Vercel (auto-deploys from `main` branch)  
**GitHub:** [github.com/samisback2024/Voxen](https://github.com/samisback2024/Voxen)  
**Supabase Project:** `gpkhehcnsggwjejkwuyv`

---

## Tech Stack

| Layer        | Technology                        | Purpose                              |
|-------------|-----------------------------------|--------------------------------------|
| Frontend    | React 19.2 + Vite 7.3             | SPA with HMR dev server             |
| Styling     | CSS-in-JS (template literal)      | Single `const CSS` block, no deps   |
| Fonts       | Plus Jakarta Sans + Lora           | Warm, human typography              |
| Auth        | Supabase Auth (email/password)    | Signup, login, session management   |
| Database    | Supabase (PostgreSQL)             | Profiles, rooms, messages, etc.     |
| Realtime    | Supabase Realtime (WebSocket)     | Live message streaming in rooms     |
| Hosting     | Vercel                            | Static build + CDN + auto-deploy    |
| Version Ctrl| Git + GitHub                      | Source control + CI/CD trigger      |

---

## Architecture Overview

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser    │────▶│   Vercel (CDN)   │     │    Supabase      │
│  React SPA   │     │  Static Assets   │     │                  │
│              │     └──────────────────┘     │  ┌─────────────┐ │
│              │──────────────────────────────▶│  │  Auth       │ │
│              │  supabase-js SDK             │  │  PostgreSQL │ │
│              │◀─────── Realtime WS ─────────│  │  Realtime   │ │
└──────────────┘                              │  │  Storage    │ │
                                              │  └─────────────┘ │
                                              └─────────────────┘
```

**Key design decisions:**
- **Single-file component:** The entire app lives in `VoxenApp.jsx` (~2260 lines). This is intentional for Phase 1 — keeps everything visible and self-contained. Phase 2 should split into modules.
- **CSS-in-JS via template literal:** All styles are in a `const CSS` string injected via `<style>{CSS}</style>`. No build tool config needed. Phase 2 could migrate to CSS Modules or Tailwind.
- **No external UI library:** Every component (modals, cards, buttons, avatars) is hand-built. Keeps bundle small (~130KB gzipped).
- **Supabase client-side only:** No backend server. Supabase RLS (Row Level Security) policies protect data. The anon key is safe to expose — RLS enforces access.

---

## Project Structure

```
voxen/
├── index.html              # Entry HTML (Vite injects JS here)
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite config (React plugin)
├── vercel.json             # SPA rewrite rules for Vercel
├── supabase-schema.sql     # Full DB schema (run in Supabase SQL Editor)
├── .env                    # Local env vars (NOT committed to git)
├── .gitignore
├── public/
│   └── vite.svg
└── src/
    ├── main.jsx            # React DOM root mount
    ├── App.jsx             # Re-exports VoxenApp
    ├── App.css             # Unused (styles are in VoxenApp.jsx)
    ├── index.css           # Global body/html reset styles
    ├── supabase.js         # Supabase client initialization
    ├── VoxenApp.jsx        # ★ MAIN APP — all UI, logic, styles
    └── assets/
        └── react.svg
```

### Key Files

| File | Lines | What It Does |
|------|-------|-------------|
| `VoxenApp.jsx` | ~2260 | Everything: CSS, constants, mock data, state, Supabase queries, all views (auth, onboard, home, room, profile, people, settings, create modal, invite modal, call modal) |
| `supabase.js` | ~10 | Creates and exports the Supabase client using env vars |
| `supabase-schema.sql` | ~178 | Full database schema — tables, indexes, RLS policies, trigger for auto-profile creation, realtime config |
| `vercel.json` | ~5 | SPA catch-all rewrite so routes don't 404 on Vercel |

---

## Design System

### Color Palette

| Token      | Hex/Value     | Usage                          |
|-----------|---------------|--------------------------------|
| `--ink`   | `#120F0C`     | Deepest background             |
| `--bg`    | `#1A1410`     | App background                 |
| `--surf`  | `#231E18`     | Card/surface background        |
| `--brd`   | `#3A332B`     | Borders                        |
| `--clay`  | `#E8845A`     | Primary accent (terracotta)    |
| `--sky`   | `#6B9EFF`     | Secondary accent (links, info) |
| `--t1`    | `#F5EDE4`     | Primary text                   |
| `--t2`    | `#A89B8C`     | Secondary text                 |

### Typography

- **Headings & UI:** Plus Jakarta Sans (weights 300–800)
- **Literary accents:** Lora (serif, for taglines)
- Base size: `13px` with fluid scaling

### Component Patterns

- **Cards:** `background: var(--surf)`, `border: 1px solid var(--brd)`, `border-radius: var(--r14)`
- **Buttons:** `.btn-primary` (clay gradient), `.btn-ghost` (transparent), `.btn-danger` (red)
- **Avatars:** Gradient backgrounds with initials, status pip overlay
- **Modals:** Overlay + centered card with `.modal-head`, `.modal-foot`
- **Animations:** `@keyframes shimmer`, `fadeUp`, `pulse` — staggered for physical feel

---

## Features (Phase 1 — Complete)

### Authentication
- [x] Email + password signup/login via Supabase Auth
- [x] Auto-profile creation on signup (trigger function)
- [x] Persistent sessions (survives page refresh)
- [x] Sign out with full state reset
- [x] Change password (in Settings)
- [x] Error messages for invalid credentials, rate limits

### Onboarding
- [x] Topic selection (3–5 from curated + searchable list)
- [x] Topics saved to user profile in Supabase
- [x] Skip onboarding on subsequent logins if topics already set

### Rooms (Circles)
- [x] Create rooms with name, purpose, visibility (public/private), member limit
- [x] Schedule rooms with date/time
- [x] Calendar export (ICS download + Google Calendar link)
- [x] Delete rooms (owner only)
- [x] Pin conclusions to rooms
- [x] 5 rooms/day limit for free users
- [x] Unlimited rooms for Verified users
- [x] Rooms persisted in Supabase `rooms` table

### Real-Time Chat
- [x] Send messages in rooms (persisted in Supabase)
- [x] Real-time message streaming via Supabase Realtime (WebSocket)
- [x] Auto-scroll to latest message
- [x] Emoji reactions on messages
- [x] Reply-to threading
- [x] Profanity filter (client-side word list)

### Connections (Partially Implemented)
- [x] Connection state machine: NONE → PENDING_SENT → ACCEPTED
- [x] Send/accept/decline connection requests
- [x] Notification system for connection events
- [ ] **Not yet wired to Supabase** — uses local mock state + `DEMO_USERS`

### Verified Badge & Subscription
- [x] Monthly ($4/mo) and Annual ($30/yr) plan toggle
- [x] Purchase persisted to Supabase `profiles` table
- [x] Verified checkmark on profile
- [x] Unlocks unlimited rooms/day

### Profile & Settings
- [x] Profile page with name, handle, initials, interests, rooms
- [x] Privacy toggles (public profile, show status, allow connections, email notifications)
- [x] Settings saved to Supabase
- [x] Change password with validation

### UI/UX
- [x] Warm charcoal design with terracotta accents
- [x] Aurora background glow effects
- [x] Animated borders and shimmer buttons
- [x] Staggered fade-up animations
- [x] Search across rooms and people
- [x] Notification panel with unread count
- [x] Responsive layout (mobile-friendly with sidebar collapse)

---

## Database Schema

Seven tables in Supabase PostgreSQL:

```
profiles          — User data (extends auth.users)
rooms             — Circles/discussion rooms
room_members      — Many-to-many: users ↔ rooms
messages          — Chat messages (linked to rooms & authors)
connections       — User-to-user connections (pending/accepted/declined)
notifications     — In-app notifications
room_creations    — Tracks daily room creation count (for 5/day limit)
```

### Key Relationships

```
auth.users  ──1:1──▶  profiles
profiles    ──1:N──▶  rooms (creator)
rooms       ──M:N──▶  profiles (via room_members)
rooms       ──1:N──▶  messages
profiles    ──1:N──▶  messages (author)
profiles    ──M:N──▶  profiles (via connections)
profiles    ──1:N──▶  notifications
profiles    ──1:N──▶  room_creations
```

### Row Level Security (RLS)

All tables have RLS enabled:
- **Profiles:** Anyone can read; users update only their own
- **Rooms:** Public rooms visible to all; private rooms visible to members/creator
- **Messages:** Readable in public rooms or rooms you're a member of; only author can insert
- **Connections:** Only sender/receiver can view/update
- **Notifications:** Only the target user can view/update

### Auto-Profile Trigger

```sql
-- When a new user signs up in auth.users, automatically create a profile:
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

The function extracts `name`, `handle`, and `initials` from the signup metadata or email.

---

## Authentication Flow

```
1. User enters email + password on auth page
2. App calls supabase.auth.signUp() or supabase.auth.signInWithPassword()
3. Supabase returns session + user object
4. onAuthStateChange listener fires → calls loadProfile()
5. loadProfile() fetches from profiles table
6. If profile has topics → go to "home" view
   If no topics → go to "onboard" view (pick 3-5 topics)
7. Session persists in localStorage (Supabase handles this)
8. On page refresh → getSession() check → auto-login
```

---

## Real-Time Messaging

```
1. User opens a room → useEffect subscribes to Supabase channel
2. Channel: supabase.channel(`room-${roomId}`)
3. Listens for: postgres_changes → INSERT on messages table
4. When new message arrives via WebSocket:
   a. Fetch author profile (name, initials, avatar color)
   b. Append to local allMessages state
   c. Auto-scroll to bottom
5. On room exit → supabase.removeChannel(channel)
```

---

## Environment Variables

| Variable | Where | Value |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | `.env` (local) + Vercel | `https://gpkhehcnsggwjejkwuyv.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `.env` (local) + Vercel | `sb_publishable_...` (safe to expose, RLS protects data) |

**Important:** The `VITE_` prefix is required for Vite to expose env vars to the client bundle.

---

## Local Development

```bash
# 1. Clone
git clone https://github.com/samisback2024/Voxen.git
cd Voxen

# 2. Install dependencies
npm install

# 3. Create .env file
echo "VITE_SUPABASE_URL=https://gpkhehcnsggwjejkwuyv.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=your_anon_key_here" >> .env

# 4. Start dev server
npm run dev

# 5. Open http://localhost:5173
```

### Commands

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Deployment

### Vercel (Current Setup)

1. Push to `main` branch on GitHub
2. Vercel auto-detects the push and rebuilds
3. Build command: `vite build` (auto-detected)
4. Output directory: `dist` (auto-detected)
5. Environment variables set in Vercel dashboard
6. `vercel.json` handles SPA routing (all paths → `index.html`)

### Supabase

- Project URL: `https://supabase.com/dashboard/project/gpkhehcnsggwjejkwuyv`
- Auth providers: Email (enabled, email confirmation OFF)
- Schema: Run `supabase-schema.sql` in SQL Editor
- Realtime enabled for: `messages`, `notifications`, `connections`

---

## Phase 2 Roadmap

### Priority 1 — Core Functionality

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Real connections** | Replace `DEMO_USERS` mock with real user discovery from `profiles` table. Wire connection requests to `connections` table in Supabase. | Medium |
| **Direct messaging** | 1:1 chat between connected users. New `direct_messages` table. | Medium |
| **Join public rooms** | Currently only creators see rooms. Add "Browse & Join" for all public rooms. | Easy |
| **Room member list** | Show who's in a room, pull from `room_members` table. | Easy |

### Priority 2 — User Experience

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Google OAuth** | Enable in Supabase Auth → Providers → Google. Needs Google Cloud OAuth credentials. | Easy |
| **Password reset** | Supabase supports magic link / reset email out of the box. | Easy |
| **User search** | Search real users by name/handle from `profiles` table. | Easy |
| **Profile editing** | Let users update name, bio, avatar color. | Easy |
| **Error boundaries** | React error boundary to prevent blank screens on crashes. | Easy |

### Priority 3 — Advanced Features

| Feature | Description | Complexity |
|---------|-------------|------------|
| **File uploads** | Images/files in chat via Supabase Storage. | Medium |
| **Push notifications** | Browser push API + service worker for offline alerts. | Hard |
| **Voice/video calls** | WebRTC peer-to-peer calling. Needs signaling server. | Hard |
| **Admin dashboard** | Manage users, rooms, reports. Separate admin role. | Medium |
| **Stripe payments** | Real subscription billing for Verified badge. | Medium |
| **Custom domains** | Point `voxen.app` or similar to Vercel. | Easy |

### Priority 4 — Code Quality

| Task | Description |
|------|-------------|
| **Split into components** | Break `VoxenApp.jsx` into `AuthPage`, `Sidebar`, `RoomView`, `ProfilePage`, etc. |
| **State management** | Move from `useState` spaghetti to React Context or Zustand. |
| **TypeScript migration** | Add type safety to props, Supabase queries, state. |
| **CSS extraction** | Move from template literal CSS to CSS Modules or Tailwind. |
| **Testing** | Add Vitest unit tests + Playwright E2E tests. |
| **CI/CD** | GitHub Actions for lint + test + deploy pipeline. |

---

## Known Limitations

1. **Single-file architecture** — `VoxenApp.jsx` is ~2260 lines. Works for Phase 1 but should be split for maintainability.
2. **Mock users** — The "People" page shows hardcoded `DEMO_USERS`, not real users from the database.
3. **Connection system** — Uses local React state (`connStates`), not persisted to Supabase `connections` table yet.
4. **No email verification** — Turned off for easier dev. Should be enabled for production.
5. **No rate limiting on client** — Supabase RLS protects data, but no client-side throttling on rapid clicks.
6. **Profanity filter** — Client-side only (can be bypassed). Phase 2 should add server-side filtering via Supabase Edge Functions.
7. **No image/file support** — Chat is text-only.
8. **Call button** — Shows a UI mockup, no real WebRTC implementation.

---

## Credits

Built by **Sam** — Phase 1 completed February 2026.  
Design philosophy: "Human-crafted warmth — feels like a premium notebook, not a cold SaaS dashboard."
