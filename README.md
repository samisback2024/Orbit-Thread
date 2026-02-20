# Orbit Thread — Think Louder, Together.

> **The social platform where ideas orbit and conversations thread.**

A full-stack real-time social platform built with React, Supabase, and Vercel.  
Users create "Circles" (rooms), have real-time conversations, connect with others, send DMs, discover nearby communities, and unlock premium features with a Verified badge.

**End Goal:** A production-grade social network live at **[OrbitThread.com](https://www.orbitthread.com)** with native apps on **Google Play Store** and **Apple App Store** — a real, shipped product competing in the social space.

---

## Table of Contents

1. [Vision & End Goal](#vision--end-goal)
2. [Live URL](#live-url)
3. [Tech Stack](#tech-stack)
4. [Architecture Overview](#architecture-overview)
5. [Project Structure](#project-structure)
6. [Design System](#design-system)
7. [Features (Phase 1 — Complete)](#features-phase-1--complete)
8. [Features (Phase 2 — Complete)](#features-phase-2--complete)
9. [Database Schema](#database-schema)
10. [Authentication Flow](#authentication-flow)
11. [Real-Time Messaging](#real-time-messaging)
12. [Environment Variables](#environment-variables)
13. [Local Development](#local-development)
14. [Deployment](#deployment)
15. [Phase 3 — Production Backend (Next)](#phase-3--production-backend-next)
16. [Phase 4 — Launch OrbitThread.com Live](#phase-4--launch-orbitthreadcom-live)
17. [Phase 5 — Native Mobile Apps (Android + iOS)](#phase-5--native-mobile-apps-android--ios)
18. [Phase 6 — Scale to Real Social Platform](#phase-6--scale-to-real-social-platform)
19. [Phase 7 — Monetization & Growth](#phase-7--monetization--growth)
20. [Domain & Infrastructure Checklist](#domain--infrastructure-checklist)
21. [App Store Submission Checklist](#app-store-submission-checklist)
22. [Known Limitations (Current)](#known-limitations-current)
23. [Credits](#credits)

---

## Vision & End Goal

```
┌─────────────────────────────────────────────────────────────────┐
│                     ORBIT THREAD                                │
│              "Think Louder, Together."                           │
│                                                                 │
│   ┌──────────┐   ┌──────────────┐   ┌──────────────────────┐   │
│   │   WEB    │   │   ANDROID    │   │        iOS           │   │
│   │ React    │   │  Play Store  │   │   App Store          │   │
│   │ orbitthread│   │  Real App    │   │   Real App           │   │
│   │ .com     │   │              │   │                      │   │
│   └──────────┘   └──────────────┘   └──────────────────────┘   │
│         │                │                     │                │
│         └────────────────┼─────────────────────┘                │
│                          ▼                                      │
│              ┌──────────────────────┐                           │
│              │   Supabase Backend   │                           │
│              │  Auth · DB · Realtime│                           │
│              │  Storage · Edge Fns  │                           │
│              └──────────────────────┘                           │
│                          │                                      │
│              ┌──────────────────────┐                           │
│              │   Stripe Payments    │                           │
│              │   Push Notifications │                           │
│              │   CDN · Analytics    │                           │
│              └──────────────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

**What we're building — Facebook-scale ambition, indie-dev execution:**

| What Facebook Has | Orbit Thread Equivalent     | Status          |
| ----------------- | --------------------------- | --------------- |
| News Feed         | Home Feed + Discover Tab    | ✅ Phase 2      |
| Groups            | Circles (Rooms)             | ✅ Phase 1      |
| Messenger         | Direct Messages (1:1 DMs)   | ✅ Phase 2 (UI) |
| Friend Requests   | Connection System           | ✅ Phase 1 (UI) |
| Reactions         | Emoji Reactions on Messages | ✅ Phase 1      |
| Stories/Reels     | —                           | 🔜 Phase 6      |
| Marketplace       | —                           | 🔜 Phase 7      |
| Live Video        | Voice/Video Calls           | 🔜 Phase 5      |
| Verified Badge    | Premium Verified ⭐         | ✅ Phase 2      |
| Android App       | React Native / Expo         | 🔜 Phase 5      |
| iOS App           | React Native / Expo         | 🔜 Phase 5      |
| facebook.com      | **OrbitThread.com**         | 🔜 Phase 4      |

---

## Live URL

| Environment               | URL                                                                                    | Status     |
| ------------------------- | -------------------------------------------------------------------------------------- | ---------- |
| **Production (Vercel)**   | Auto-deploys from `main` branch                                                        | ✅ Live    |
| **Target Domain**         | [www.OrbitThread.com](https://www.orbitthread.com)                                     | 🔜 Phase 4 |
| **GitHub**                | [github.com/samisback2024/Orbit-Thread](https://github.com/samisback2024/Orbit-Thread) | ✅ Active  |
| **Supabase Project**      | `gpkhehcnsggwjejkwuyv`                                                                 | ✅ Active  |
| **Android (Google Play)** | Coming Soon                                                                            | 🔜 Phase 5 |
| **iOS (App Store)**       | Coming Soon                                                                            | 🔜 Phase 5 |

---

## Tech Stack

| Layer        | Technology                     | Purpose                           |
| ------------ | ------------------------------ | --------------------------------- |
| Frontend     | React 19.2 + Vite 7.3          | SPA with HMR dev server           |
| Styling      | CSS-in-JS (template literal)   | Single `const CSS` block, no deps |
| Fonts        | Plus Jakarta Sans + Lora       | Warm, human typography            |
| Auth         | Supabase Auth (email/password) | Signup, login, session management |
| Database     | Supabase (PostgreSQL)          | Profiles, rooms, messages, etc.   |
| Realtime     | Supabase Realtime (WebSocket)  | Live message streaming in rooms   |
| Hosting      | Vercel                         | Static build + CDN + auto-deploy  |
| Version Ctrl | Git + GitHub                   | Source control + CI/CD trigger    |

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

- **Single-file component:** The entire app lives in `OrbitThreadApp.jsx` (~2943 lines). This is intentional for rapid iteration — keeps everything visible and self-contained. Future phases should split into modules.
- **CSS-in-JS via template literal:** All styles are in a `const CSS` string injected via `<style>{CSS}</style>`. No build tool config needed. Phase 2 could migrate to CSS Modules or Tailwind.
- **No external UI library:** Every component (modals, cards, buttons, avatars) is hand-built. Keeps bundle small (~130KB gzipped).
- **Supabase client-side only:** No backend server. Supabase RLS (Row Level Security) policies protect data. The anon key is safe to expose — RLS enforces access.

---

## Project Structure

```
orbit-thread/
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
    ├── App.jsx             # Re-exports OrbitThreadApp
    ├── App.css             # Unused (styles are in OrbitThreadApp.jsx)
    ├── index.css           # Global body/html reset styles
    ├── supabase.js         # Supabase client initialization
    ├── OrbitThreadApp.jsx  # ★ MAIN APP — all UI, logic, styles
    └── assets/
        └── react.svg
```

### Key Files

| File                  | Lines | What It Does                                                                                                                                                                                           |
| --------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `OrbitThreadApp.jsx`  | ~2943 | Everything: CSS, constants, mock data, state, Supabase queries, all views (auth, onboard, home, room, profile, people, settings, create modal, invite modal, call modal, discover, DMs, premium modal) |
| `supabase.js`         | ~10   | Creates and exports the Supabase client using env vars                                                                                                                                                 |
| `supabase-schema.sql` | ~178  | Full database schema — tables, indexes, RLS policies, trigger for auto-profile creation, realtime config                                                                                               |
| `vercel.json`         | ~5    | SPA catch-all rewrite so routes don't 404 on Vercel                                                                                                                                                    |

---

## Design System

### Color Palette

| Token    | Hex/Value | Usage                          |
| -------- | --------- | ------------------------------ |
| `--ink`  | `#120F0C` | Deepest background             |
| `--bg`   | `#1A1410` | App background                 |
| `--surf` | `#231E18` | Card/surface background        |
| `--brd`  | `#3A332B` | Borders                        |
| `--clay` | `#E8845A` | Primary accent (terracotta)    |
| `--sky`  | `#6B9EFF` | Secondary accent (links, info) |
| `--t1`   | `#F5EDE4` | Primary text                   |
| `--t2`   | `#A89B8C` | Secondary text                 |

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

## Features (Phase 2 — Complete)

### Geo-Radius Room Discovery

- [x] Radius selector when creating a room (1 mi → Worldwide, 7 options)
- [x] Haversine formula calculates distance between users and rooms
- [x] Geo badge on room cards shows radius setting
- [x] "Near me" toggle on Discover tab filters rooms by GPS proximity
- [x] `navigator.geolocation` API for user location with permission prompt
- [x] Geo-notification toast when creating a geo-fenced room

### Public Room Discovery + Join/Leave

- [x] Home screen tabs: "My Rooms" / "Discover"
- [x] Discover grid with 8 seed public rooms across categories
- [x] Topic filter chips (11 categories: Gaming, Music, Tech, etc.)
- [x] Join / Leave / Open buttons per discover card
- [x] Joined rooms appear in "My Rooms" tab
- [x] Member count + topic badges on discover cards

### Direct Messaging (1:1 DMs)

- [x] DM view accessible from sidebar navigation
- [x] Contact sidebar listing all connected users
- [x] Bubble-style chat layout (sent vs received)
- [x] Simulated auto-replies (1.5s delay, 4 reply templates)
- [x] Empty state with prompt to start a conversation
- [x] Timestamps on DM messages

### Stripe Premium / Verified Badge Modal

- [x] ⭐ icon in sidebar opens Premium modal
- [x] Feature list (Unlimited Rooms, Verified Badge, Priority Support, Early Access, Custom Themes)
- [x] $4.99/month pricing display
- [x] "Start Free Trial" button activates verified status
- [x] Verified badge persisted to Supabase `profiles` table
- [x] Verified checkmark visible in sidebar and profile page

### Image Upload in Room Chat

- [x] 📎 paperclip button in message composer
- [x] FileReader API converts images to base64
- [x] Image preview with ✕ dismiss before sending
- [x] 5 MB file size limit with error feedback
- [x] Images render inline in chat messages (`msg-img` class)
- [x] Supports JPEG, PNG, GIF, WebP formats

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

| Variable                 | Where                   | Value                                                    |
| ------------------------ | ----------------------- | -------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | `.env` (local) + Vercel | `https://gpkhehcnsggwjejkwuyv.supabase.co`               |
| `VITE_SUPABASE_ANON_KEY` | `.env` (local) + Vercel | `sb_publishable_...` (safe to expose, RLS protects data) |

**Important:** The `VITE_` prefix is required for Vite to expose env vars to the client bundle.

---

## Local Development

```bash
# 1. Clone
git clone https://github.com/samisback2024/Orbit-Thread.git
cd Orbit-Thread

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

| Command           | What It Does                     |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start Vite dev server with HMR   |
| `npm run build`   | Production build to `dist/`      |
| `npm run preview` | Preview production build locally |
| `npm run lint`    | Run ESLint                       |

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

## Phase 3 — Production Backend (Next)

> **Goal:** Replace all mocks and simulations with real Supabase-backed features. After this phase, every feature works with real data and real users.

### 3.1 — Wire Real Connections to Supabase

- [ ] Replace `DEMO_USERS` array with real user discovery from `profiles` table
- [ ] Wire connection requests to `connections` table (pending → accepted → declined)
- [ ] Show real "People" page with actual registered users
- [ ] Real-time connection status updates via Supabase Realtime
- [ ] Block/unblock user support

### 3.2 — Persist Direct Messages

- [ ] Create `direct_messages` table in Supabase with RLS policies
- [ ] Wire DM send/receive to real database writes
- [ ] Supabase Realtime subscription for live DM delivery
- [ ] Remove simulated auto-replies — real message delivery only
- [ ] Unread message count badge on DM sidebar icon
- [ ] Message read receipts (optional)

### 3.3 — Persist Geo Rooms

- [ ] Add `radius`, `lat`, `lng` columns to `rooms` table
- [ ] Replace `SEED_ROOMS` with real user-created discoverable rooms
- [ ] Server-side proximity query using PostGIS or Haversine SQL function
- [ ] Geo-filtered Discover tab pulls from real database

### 3.4 — Image Upload via Supabase Storage

- [ ] Create `chat-files` Supabase Storage bucket
- [ ] Upload images to Storage instead of base64 inline
- [ ] Store public URL in `messages.image_url` column
- [ ] Image compression before upload (client-side, < 1MB)
- [ ] Support image previews / thumbnails

### 3.5 — Real Stripe Payment Integration

- [ ] Create Stripe account and get API keys
- [ ] Build Supabase Edge Function for Stripe Checkout session creation
- [ ] Stripe webhook → Supabase Edge Function → update `profiles.verified`
- [ ] Handle subscription renewal, cancellation, and failed payments
- [ ] Receipt emails via Stripe
- [ ] In-app purchase flow for mobile (Phase 5)

### 3.6 — Google OAuth & Password Reset

- [ ] Enable Google OAuth in Supabase Auth → Providers
- [ ] Set up Google Cloud OAuth credentials (Client ID + Secret)
- [ ] Add "Sign in with Google" button on auth page
- [ ] Enable magic link / password reset email flow
- [ ] Apple Sign-In (required for iOS App Store — Phase 5)

### 3.7 — Server-Side Safety

- [ ] Supabase Edge Functions for server-side profanity filtering
- [ ] Rate limiting on message sends (Edge Function middleware)
- [ ] Content moderation queue for reported messages
- [ ] Email verification toggle (enable for production)

---

## Phase 4 — Launch OrbitThread.com Live

> **Goal:** Get a real custom domain pointing to the live app. Users visit **OrbitThread.com** and use it like any real social platform.

### 4.1 — Domain Setup

| Step | Action              | Details                                                                                         |
| ---- | ------------------- | ----------------------------------------------------------------------------------------------- |
| 1    | **Buy domain**      | Purchase `orbitthread.com` from Namecheap, Google Domains, or Cloudflare Registrar (~$12/yr)    |
| 2    | **Add to Vercel**   | Vercel Dashboard → Project → Settings → Domains → Add `orbitthread.com` + `www.orbitthread.com` |
| 3    | **DNS records**     | Point nameservers to Vercel OR add A record (`76.76.21.21`) + CNAME (`cname.vercel-dns.com`)    |
| 4    | **SSL certificate** | Vercel auto-provisions Let's Encrypt SSL — HTTPS works automatically                            |
| 5    | **Verify**          | Visit `https://www.orbitthread.com` — should load the app                                       |

### 4.2 — Production Hardening

- [ ] Enable Supabase email verification for all signups
- [ ] Set up Supabase custom SMTP (SendGrid / Resend / Postmark) for branded emails
- [ ] Add `<meta>` tags for SEO: title, description, Open Graph, Twitter cards
- [ ] Favicon + Apple touch icon + `manifest.json` for PWA
- [ ] Add Google Analytics or Plausible for traffic tracking
- [ ] Error tracking with Sentry (free tier)
- [ ] Uptime monitoring (UptimeRobot or Better Uptime — free)

### 4.3 — Legal Requirements

- [ ] **Privacy Policy** page (required for app stores and GDPR)
- [ ] **Terms of Service** page
- [ ] **Cookie consent** banner (EU law if serving EU users)
- [ ] **COPPA compliance** notice (if users could be under 13)
- [ ] **Contact / Support** page or email

### 4.4 — Pre-Launch Polish

- [ ] Landing page / marketing homepage (hero section, feature cards, CTA)
- [ ] Loading skeleton screens instead of blank states
- [ ] 404 page with navigation back to home
- [ ] Offline fallback page (service worker)
- [ ] Performance audit (Lighthouse score > 90)
- [ ] Accessibility audit (WCAG 2.1 AA)

---

## Phase 5 — Native Mobile Apps (Android + iOS)

> **Goal:** Ship real native apps to Google Play Store and Apple App Store. Users download "Orbit Thread" on their phone and use it like Instagram, Facebook, or Twitter.

### 5.1 — Technology Choice

| Option                      | Pros                                                                                 | Cons                                          | Recommended      |
| --------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------- | ---------------- |
| **React Native + Expo**     | Shares React knowledge, one codebase for both platforms, huge ecosystem, OTA updates | Slightly less native feel                     | ✅ **Best fit**  |
| **Capacitor (Ionic)**       | Wraps existing React web app, fastest to ship                                        | Performance limitations, feels like a webview | Good for v1 MVP  |
| **Flutter**                 | Excellent performance, beautiful UI                                                  | New language (Dart), rewrite needed           | Overkill for now |
| **Native (Swift + Kotlin)** | Maximum performance                                                                  | Two separate codebases, 2x development time   | Future option    |

**Recommended path: React Native with Expo**

- Reuse existing Supabase client, auth flow, and business logic
- Expo handles app signing, builds, and store submissions
- One codebase → Android APK + iOS IPA

### 5.2 — Mobile App Project Setup

```bash
# Install Expo CLI
npm install -g expo-cli

# Create new Expo project alongside web app
npx create-expo-app orbit-thread-mobile --template blank-typescript

# Install shared dependencies
cd orbit-thread-mobile
npx expo install @supabase/supabase-js
npx expo install @react-navigation/native @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install expo-notifications expo-image-picker expo-location
npx expo install @react-native-async-storage/async-storage
```

### 5.3 — Mobile Feature Parity

| Web Feature           | Mobile Equivalent                                   | Priority |
| --------------------- | --------------------------------------------------- | -------- |
| Auth (email/password) | Same Supabase Auth with AsyncStorage                | P0       |
| Google OAuth          | Expo AuthSession + Google provider                  | P0       |
| Home Feed + Discover  | React Navigation tabs + FlatList                    | P0       |
| Room Chat (Realtime)  | Same Supabase Realtime, ScrollView                  | P0       |
| Direct Messages       | Same DM system, push notifications                  | P0       |
| Connections           | Same flow, haptic feedback on accept                | P1       |
| Image Upload          | `expo-image-picker` → Supabase Storage              | P1       |
| Geo Discovery         | `expo-location` → proximity filter                  | P1       |
| Push Notifications    | `expo-notifications` + Supabase Edge Function       | P1       |
| Premium/Stripe        | In-App Purchases (required by stores)               | P2       |
| Voice/Video Calls     | WebRTC via `react-native-webrtc`                    | P2       |
| Biometric Login       | `expo-local-authentication` (Face ID / fingerprint) | P2       |

### 5.4 — Google Play Store Submission

| Step | Action                  | Details                                                                                         |
| ---- | ----------------------- | ----------------------------------------------------------------------------------------------- |
| 1    | **Google Play Console** | Create account at [play.google.com/console](https://play.google.com/console) — one-time $25 fee |
| 2    | **App listing**         | Title: "Orbit Thread", category: Social, description, screenshots (phone + tablet)              |
| 3    | **Content rating**      | Complete IARC questionnaire (social app = Everyone 10+)                                         |
| 4    | **Privacy Policy URL**  | Must link to `https://orbitthread.com/privacy`                                                  |
| 5    | **Build APK/AAB**       | `eas build --platform android` (Expo EAS Build)                                                 |
| 6    | **Internal testing**    | Upload AAB to Internal Testing track → test with 10+ users                                      |
| 7    | **Closed testing**      | Open to 20-100 beta testers, collect feedback                                                   |
| 8    | **Production release**  | Submit for review (typically 1-3 days for approval)                                             |
| 9    | **Data safety form**    | Declare what data is collected (required since 2022)                                            |

### 5.5 — Apple App Store Submission

| Step | Action                       | Details                                                                                         |
| ---- | ---------------------------- | ----------------------------------------------------------------------------------------------- |
| 1    | **Apple Developer Program**  | Enroll at [developer.apple.com](https://developer.apple.com) — $99/year                         |
| 2    | **Requires a Mac**           | Xcode is needed for iOS builds (or use Expo EAS Build cloud)                                    |
| 3    | **App Store Connect**        | Create app listing: name, subtitle, keywords, screenshots (6.7" + 5.5")                         |
| 4    | **Apple Sign-In**            | **REQUIRED** if you offer Google/social login — must also offer Apple Sign-In                   |
| 5    | **In-App Purchases**         | Apple requires using their IAP system for digital goods (30% cut) — set up in App Store Connect |
| 6    | **Build IPA**                | `eas build --platform ios` (Expo EAS Build handles signing)                                     |
| 7    | **TestFlight**               | Upload build → invite beta testers via TestFlight                                               |
| 8    | **App Review**               | Submit for review (typically 1-2 days, strict guidelines)                                       |
| 9    | **Privacy nutrition labels** | Declare data collection practices in App Store Connect                                          |
| 10   | **Age rating**               | Social apps typically rated 12+ or 17+ depending on content moderation                          |

### 5.6 — Mobile Project Structure

```
orbit-thread/                    ← Existing web app (this repo)
orbit-thread-mobile/             ← New React Native / Expo app
├── app.json                     # Expo config (name, icons, splash)
├── App.tsx                      # Root navigation
├── src/
│   ├── navigation/
│   │   ├── AuthStack.tsx        # Login / Signup / Onboard screens
│   │   ├── MainTabs.tsx         # Home / Discover / DMs / Profile tabs
│   │   └── RoomStack.tsx        # Room → Chat flow
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── OnboardScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── DiscoverScreen.tsx
│   │   ├── RoomChatScreen.tsx
│   │   ├── DMScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/
│   │   ├── RoomCard.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── Avatar.tsx
│   │   ├── ConnectionButton.tsx
│   │   └── VerifiedBadge.tsx
│   ├── lib/
│   │   ├── supabase.ts          # Shared Supabase client
│   │   ├── auth.ts              # Auth helpers
│   │   └── notifications.ts    # Push notification setup
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useRealtime.ts
│   │   └── useLocation.ts
│   └── theme/
│       └── colors.ts            # Orbit Thread design tokens
├── assets/
│   ├── icon.png                 # App icon (1024x1024)
│   ├── splash.png               # Splash screen
│   └── adaptive-icon.png        # Android adaptive icon
└── eas.json                     # EAS Build config
```

---

## Phase 6 — Scale to Real Social Platform

> **Goal:** Add the features that make a social network sticky and competitive — the features that keep users coming back daily.

### 6.1 — Feed & Content

- [ ] **User posts / status updates** — text + image posts on your profile (like Facebook wall)
- [ ] **News Feed algorithm** — show posts from connections + trending rooms
- [ ] **Stories** — 24-hour disappearing photo/video posts
- [ ] **Hashtags & trending topics** — discover content by tag
- [ ] **Content bookmarks / saves** — save posts and messages to revisit
- [ ] **Share / repost** — amplify posts to your connections

### 6.2 — Social Graph

- [ ] **Mutual connections** — "You and Alex have 5 mutual connections"
- [ ] **Connection suggestions** — "People you may know" based on topics + location
- [ ] **Follow vs Connect** — public follow (one-way) + private connect (two-way)
- [ ] **User verification** — official verification for public figures (beyond premium)

### 6.3 — Communication

- [ ] **Group DMs** — multi-person direct message threads
- [ ] **Voice messages** — record and send audio clips in chat
- [ ] **Voice/Video calls** — WebRTC peer-to-peer calling with signaling server
- [ ] **Screen sharing** — in-call screen share for collaboration
- [ ] **Message search** — full-text search across all messages

### 6.4 — Media & Rich Content

- [ ] **Photo albums** — upload multiple images to a post
- [ ] **Video upload** — short-form video support
- [ ] **Link previews** — auto-fetch Open Graph data for shared URLs
- [ ] **GIF picker** — Giphy / Tenor integration in chat
- [ ] **File sharing** — documents, PDFs in rooms and DMs
- [ ] **Profile photos** — upload real avatar images (Supabase Storage)

### 6.5 — Community & Moderation

- [ ] **Report system** — report messages, users, rooms for review
- [ ] **Admin dashboard** — manage users, rooms, reports, analytics
- [ ] **Moderator roles** — room-level moderators with kick/mute powers
- [ ] **Content filtering AI** — ML-based content moderation (OpenAI Moderation API)
- [ ] **User blocking** — block users from contacting or seeing your content
- [ ] **Mute notifications** — per-room and per-user mute

### 6.6 — Performance & Infrastructure

- [ ] **CDN for images** — Cloudflare or Vercel Image Optimization
- [ ] **Database indexing** — optimize queries for 10K+ users
- [ ] **Connection pooling** — Supabase connection pooler (PgBouncer)
- [ ] **Edge functions** — move heavy logic server-side
- [ ] **Caching layer** — Redis for frequently accessed data
- [ ] **Database backups** — automated daily backups

---

## Phase 7 — Monetization & Growth

> **Goal:** Build a sustainable business around Orbit Thread.

### 7.1 — Revenue Streams

| Stream                   | Model                                       | Implementation              |
| ------------------------ | ------------------------------------------- | --------------------------- |
| **Orbit Verified**       | $4.99/mo or $29.99/yr subscription          | Stripe (web) + IAP (mobile) |
| **Orbit Pro (Creators)** | $14.99/mo — analytics, scheduling, priority | Stripe + IAP                |
| **Promoted Rooms**       | Pay to feature your room in Discover        | Stripe                      |
| **In-app tipping**       | Tip users in rooms (platform takes 15%)     | Stripe Connect              |
| **Ads (optional)**       | Non-intrusive sponsored content in feed     | Google AdMob (mobile)       |

### 7.2 — Growth Strategy

- [ ] **Invite system** — "Invite 3 friends, unlock custom themes"
- [ ] **Social sharing** — share rooms / posts to Twitter, Instagram, WhatsApp
- [ ] **SEO** — public room pages indexed by Google
- [ ] **Content creator program** — attract influencers to host rooms
- [ ] **University partnerships** — launch at college campuses
- [ ] **Product Hunt launch** — get early adopter exposure
- [ ] **App Store Optimization (ASO)** — keywords, screenshots, ratings

### 7.3 — Analytics & Metrics

| Metric                   | Tool                             | Why                 |
| ------------------------ | -------------------------------- | ------------------- |
| Daily Active Users (DAU) | Mixpanel / Amplitude             | Core growth metric  |
| Retention (D1, D7, D30)  | Mixpanel                         | Measures stickiness |
| Messages sent/day        | Supabase queries                 | Engagement health   |
| Room creation rate       | Supabase queries                 | Content creation    |
| Conversion to Premium    | Stripe Dashboard                 | Revenue metric      |
| App Store ratings        | App Store Connect / Play Console | User satisfaction   |
| Crash rate               | Sentry                           | Stability           |
| Page load time           | Vercel Analytics                 | Performance         |

---

## Domain & Infrastructure Checklist

> **Everything needed to go from side project to live production app.**

### Accounts to Create

| Account             | URL                             | Cost                  | Purpose                     |
| ------------------- | ------------------------------- | --------------------- | --------------------------- |
| Domain registrar    | namecheap.com or cloudflare.com | ~$12/yr               | Own `orbitthread.com`       |
| Vercel (Pro)        | vercel.com                      | Free → $20/mo         | Web hosting + CDN           |
| Supabase (Pro)      | supabase.com                    | Free → $25/mo         | Backend + database          |
| Stripe              | stripe.com                      | Free (2.9% + 30¢/txn) | Payments                    |
| Google Play Console | play.google.com/console         | $25 one-time          | Android app distribution    |
| Apple Developer     | developer.apple.com             | $99/yr                | iOS app distribution        |
| Expo (EAS)          | expo.dev                        | Free → $99/mo         | Mobile app builds           |
| Sentry              | sentry.io                       | Free tier             | Error tracking              |
| SendGrid / Resend   | sendgrid.com or resend.com      | Free tier             | Transactional emails        |
| Google Cloud        | console.cloud.google.com        | Free                  | OAuth credentials           |
| Cloudflare          | cloudflare.com                  | Free                  | DNS + DDoS protection + CDN |

### Domain Configuration (Step by Step)

```
1. Buy orbitthread.com (Namecheap / Cloudflare — ~$12/yr)
2. In Vercel Dashboard:
   → Project Settings → Domains
   → Add "orbitthread.com"
   → Add "www.orbitthread.com"
3. At your registrar, set DNS:
   → A Record:     @    →  76.76.21.21
   → CNAME Record: www  →  cname.vercel-dns.com
4. Wait 5-30 minutes for DNS propagation
5. Vercel auto-provisions SSL certificate
6. Test: https://www.orbitthread.com ✅
```

---

## App Store Submission Checklist

### Required Assets

| Asset                | Spec                                | Needed For  |
| -------------------- | ----------------------------------- | ----------- |
| App Icon             | 1024×1024 PNG, no transparency      | Both stores |
| Feature Graphic      | 1024×500 PNG                        | Google Play |
| Phone Screenshots    | 1290×2796 (6.7") + 1242×2208 (5.5") | App Store   |
| Phone Screenshots    | 1080×1920 minimum                   | Google Play |
| Tablet Screenshots   | 2048×2732 (12.9" iPad)              | App Store   |
| Splash Screen        | 1284×2778 PNG                       | Both (Expo) |
| Short description    | 80 characters max                   | Google Play |
| Full description     | 4000 characters max                 | Both        |
| Privacy Policy URL   | `https://orbitthread.com/privacy`   | Both        |
| Terms of Service URL | `https://orbitthread.com/terms`     | Both        |
| Support email        | support@orbitthread.com             | Both        |

### Pre-Submission Checklist

- [ ] App icon designed and exported at all required sizes
- [ ] Screenshots captured on real devices / simulator
- [ ] Privacy policy page live at orbitthread.com/privacy
- [ ] Terms of service page live at orbitthread.com/terms
- [ ] Content rating questionnaire completed
- [ ] Data safety / privacy nutrition labels filled out
- [ ] Apple Sign-In implemented (required if Google Sign-In is offered)
- [ ] In-app purchases configured in App Store Connect / Play Console
- [ ] App tested on physical devices (Android + iPhone)
- [ ] Crash-free rate > 99%
- [ ] No placeholder content or "lorem ipsum" in the app

---

## Known Limitations (Current)

1. **Single-file architecture** — `OrbitThreadApp.jsx` is ~2943 lines. Works for rapid iteration but should be split for maintainability.
2. **Mock users** — The "People" page shows hardcoded `DEMO_USERS`, not real users from the database.
3. **Connection system** — Uses local React state (`connStates`), not persisted to Supabase `connections` table yet.
4. **No email verification** — Turned off for easier dev. Should be enabled for production.
5. **No rate limiting on client** — Supabase RLS protects data, but no client-side throttling on rapid clicks.
6. **Profanity filter** — Client-side only (can be bypassed). Should add server-side filtering via Supabase Edge Functions.
7. **DMs are simulated** — Auto-replies are client-side placeholders. Needs `direct_messages` table + realtime.
8. **Images stored as base64** — Works but bloats message payload. Should migrate to Supabase Storage bucket.
9. **Premium/Stripe is simulated** — No real payment flow. Needs Stripe Checkout + webhook integration.
10. **Geo rooms not persisted** — Room radius/lat/lng not saved to Supabase yet. Seed rooms are hardcoded.
11. **Call button** — Shows a UI mockup, no real WebRTC implementation.
12. **No custom domain** — Currently on Vercel auto-generated URL. Needs `orbitthread.com` domain purchase + DNS setup.
13. **No mobile apps** — Web only. Needs React Native / Expo project for Play Store + App Store.

---

## Execution Timeline (Estimated)

| Phase      | What                      | Duration   | Milestone                                      |
| ---------- | ------------------------- | ---------- | ---------------------------------------------- |
| ✅ Phase 1 | Core web app              | Complete   | Auth, rooms, realtime chat, connections UI     |
| ✅ Phase 2 | Discovery + DMs + Premium | Complete   | Geo rooms, DM UI, image upload, Verified badge |
| 🔜 Phase 3 | Production backend        | 4-6 weeks  | All mocks replaced with real Supabase data     |
| 🔜 Phase 4 | Launch OrbitThread.com    | 1-2 weeks  | Custom domain live, SEO, legal pages           |
| 🔜 Phase 5 | Mobile apps               | 6-10 weeks | Android on Play Store, iOS on App Store        |
| 🔜 Phase 6 | Scale features            | 8-12 weeks | Posts, stories, video calls, admin tools       |
| 🔜 Phase 7 | Monetize & grow           | Ongoing    | Real revenue, marketing, user growth           |

---

## Credits

Built by **Sam** — Phase 1 & 2 completed February 2026.  
Design philosophy: "Human-crafted warmth — feels like a premium notebook, not a cold SaaS dashboard."

**End goal:** A live social platform at **OrbitThread.com** with native apps on **Google Play Store** and **Apple App Store** — not a portfolio project, a real product.
