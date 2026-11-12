# SumashDesk — Frontend (Nuxt 4)

The team app for SumashDesk: WhatsApp inbox, contacts, broadcasts, reports and settings.
It talks only to the SumashDesk Django API (`sumashdesk-backend`) — no WhatsApp credentials are ever in the browser.

## Setup

Requirements: Node 20+ and the backend running.

```bash
npm install
cp .env.example .env      # set NUXT_PUBLIC_API_BASE to your API, e.g. http://127.0.0.1:8000/api/v1
npm run dev               # http://localhost:3000
```

| Variable | Meaning |
|---|---|
| `NUXT_PUBLIC_API_BASE` | Django API including `/api/v1`, no trailing slash |
| `NUXT_PUBLIC_WS_BASE` | Optional WebSocket origin (`wss://api.example.com`). Empty = derived from the API URL |
| `NUXT_PUBLIC_APP_NAME` | Name shown on the sign-in and invite pages |

The frontend origin must be listed in the backend's `CORS_ALLOWED_ORIGINS`, and the backend `FRONTEND_URL` must point
here so invitation (`/accept-invite`) and password-reset (`/reset-password`) links open this app.

## Production

It is a single-page app (`ssr: false`), so it can be hosted as static files:

```bash
npm run generate          # → .output/public  (upload to nginx / any static host)
# or
npm run build && node .output/server/index.mjs
```
For static hosting, send unknown paths to `index.html` (nginx: `try_files $uri $uri/ /index.html;`).

## How it works

- **Sign-in**: `@sidebase/nuxt-auth` (local provider) → `POST /auth/login/`, session from `GET /auth/me/`.
  `composables/useApi.ts` adds the token, refreshes it once on a 401 (shared by all requests and safe with several tabs),
  and shows the backend's own error message. Tokens are renewed in the background every 10 minutes (`plugins/auth-refresh.client.ts`).
- **Roles**: `/auth/me/` returns `capabilities`. The menu (`components/app/Sidebar.vue`) and buttons use `useSession().can()`,
  and pages declare `definePageMeta({ capability: '…' })` (`middleware/capability.global.ts`). The API enforces the same rules.
- **Realtime**: `composables/useRealtime.ts` keeps one WebSocket per tab (ticket auth, ping, auto-reconnect, resync after
  reconnect). The inbox list, open chat, sidebar badges, dashboard, members and notifications update live.
  New-message sound and desktop notifications follow each user's preferences.
- **Design system**: `components/sd/*` (buttons, modals, tables, stats, tabs…) on CSS tokens in `assets/css/tailwind.css`,
  light and dark themes, responsive down to phone width. No `alert()`/`confirm()` — `useConfirm()` + `<SdConfirmHost/>`.

## Pages

| Page | Who | What |
|---|---|---|
| `/login`, `/forgot-password`, `/reset-password`, `/accept-invite` | public | sign-in, reset and invitation flows |
| `/dashboard/inbox` | everyone | live chats, quick filters (active 24 h / template needed / waiting), reply with text, emoji, photos, files, **voice messages**, quick replies (/ or ⚡), templates with headers/buttons, reactions, notes, assign, pending, resolve, snooze, follow-ups, ratings |
| `/dashboard` | everyone | today's numbers (team view for managers), 7-day chart, WhatsApp status |
| `/dashboard/contacts`, `/dashboard/customer-360` | everyone (import/export/block/tags: managers) | CRM; Customer 360 = customer list on the left, full profile on the right |
| `/dashboard/follow-ups` | everyone (own) / managers (all) | reminders |
| `/dashboard/broadcast` | Admin, Manager | campaigns with audience preview and scheduling |
| `/dashboard/templates`, `/dashboard/quick-replies` | everyone (create / sync templates, team replies: managers) | message assets |
| `/dashboard/reports`, `/dashboard/csat` | everyone (own) / managers (team, export, settings) | performance, team gaps, heat map |
| `/dashboard/members` | Admin, Manager | members and invitations |
| `/dashboard/settings` | everyone (personal) / managers (workspace) / admin (WhatsApp, data & storage clean-up, audit) | settings |
| `/dashboard/profile`, `/dashboard/notifications` | everyone | profile, password, availability; attention feed |
