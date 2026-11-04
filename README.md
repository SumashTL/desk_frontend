# SumashDesk — WhatsApp Business Management Frontend

A single-company WhatsApp support workspace built by updating the supplied Nuxt 4 project. The current build is a frontend-only interactive demo: records are stored in browser `localStorage`; no Django API or Meta WhatsApp Cloud API connection is made.

## Included workspace

The primary navigation contains the core communication modules plus customer experience and follow-up tools:

1. **Inbox** — conversation queues and filters, search, assignment, priority/status, message composer, quick replies, approved-template picker, attachment simulation, internal notes, customer tags, timeline, follow-up reminders and conversation persistence.
2. **Dashboard** — operational KPI cards, activity and team overview using demo data.
3. **Contacts** — searchable customer directory, create/edit/delete, local persistence, CSV import/export and reset-to-seed.
4. **Broadcast** — campaign records with create/edit/delete, pause/resume/cancel and local persistence. Delivery metrics are simulated.
5. **Quick Replies** — saved response records, shortcuts, categories and CRUD. Inbox picker reads the shared local quick-reply collection.
6. **Templates** — template catalog and approval-state management. Inbox picker lists approved templates only.
7. **Team Members** — member records, roles, availability and CRUD.
8. **Reports** — demo conversation, SLA and agent performance summaries with date-range selector.
9. **Customer 360°** — customer profile, contact details, consent status, segments, tags, internal notes, conversation timeline, satisfaction snapshot and JSON export.
10. **Follow-ups** — due-today, overdue, upcoming and completed reminders with create/complete/delete actions.
11. **Customer Satisfaction (CSAT)** — satisfaction score, average rating, rating distribution, customer comments, low-rating review queue and configurable survey preferences.

## Appearance

- Day and night themes are available from the theme icon in the sidebar footer.
- Theme selection is persisted in browser storage under `sumashdesk-theme`.
- The visual palette uses soft mist surfaces, deep ink text and calm teal accents.
- Layouts are responsive; the sidebar can collapse.
- Shared page spacing, typography, cards, form controls and action-button sizing are standardized across non-Inbox modules. Inbox retains its dedicated three-pane workspace layout.

## Run locally

Use Node.js compatible with the installed Nuxt 4 release.

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Nuxt. Demo login accepts any valid email address and any non-empty password; it does not authenticate against a server.

## Environment

```env
NUXT_PUBLIC_APP_NAME=SumashDesk
NUXT_PUBLIC_DEMO_MODE=true
NUXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api/v1
```

`NUXT_PUBLIC_API_BASE` is a future integration setting only in this frontend demo. No mock HTTP endpoints are created and no API requests are required in demo mode. Do not place secrets in `NUXT_PUBLIC_*` variables.

## Demo data and persistence

- Data is stored in the current browser profile. It is not shared across browsers or devices.
- Most CRUD collections use keys prefixed with `desk-demo:`; other module state uses `sumashdesk-*` keys.
- Use each module's **Reset demo data** action to restore its seed records.
- CSV import/export is available in Contacts. CSV import expects a header row matching the visible column names.
- Customer 360°, CSAT preferences, feedback review state and Follow-ups are stored locally in browser storage.
- CSAT survey sending is represented as a demo action; real delivery requires an approved WhatsApp template and backend/Cloud API integration.

## Important demo limitations

This is not a production WhatsApp integration. Sending a message, adding an attachment, campaign delivery/read metrics, SLA figures, notifications and team presence are simulated locally. A real multi-user workspace requires backend persistence, authentication/authorization, Meta WhatsApp Business Platform credentials/webhooks, message delivery workers, file storage, audit logging and server-side validation. Do not use the sample data as live customer records.

## Suggested Django REST Framework integration boundary

Keep the UI components and page contracts stable and replace the local collection/composable data source with service modules that call the configured API base. Suggested resource groups:

- `/conversations`, `/messages`, `/assignments`, `/internal-notes`, `/follow-ups`
- `/contacts`, `/contact-tags`, `/contact-groups`
- `/broadcast-campaigns`, `/broadcast-recipients`
- `/quick-replies`, `/whatsapp-templates`
- `/team-members`, `/roles`, `/permissions`
- `/customer-profiles`, `/customer-consents`, `/customer-notes`, `/csat-surveys`, `/csat-responses`, `/reports`, `/settings`, `/audit-logs`

Enforce all permissions, consent rules, WhatsApp session-window/template constraints and delivery state transitions on the server. The browser demo is not a security boundary.

## Compile fix update
The Sidebar.vue compile error caused by a literal `\\n` sequence inside the navigation array has been corrected. Customer 360°, Follow-ups and Customer Satisfaction are included in the sidebar navigation. The delivered archive extracts into a folder named `desk_frontend`.

## Customer Satisfaction rating flow
- Inbox conversation status set to **Resolved** queues one local CSAT request for that conversation when CSAT is enabled.
- Default live design: WhatsApp Flow with a single-choice field containing five star-labelled choices (⭐ through ⭐⭐⭐⭐⭐). The Flow asks for a rating only; no comment field or extra questions.
- Fallback: three native WhatsApp reply buttons labelled `1`, `2`, and `3`.
- This frontend records a demo queue event only. Live delivery and response capture require a Django backend, WhatsApp Cloud API, published Flow/template and inbound webhook.
- See `FEATURE_GUIDE.md` for production setup notes and reporting rules.

## Runtime
Use Node.js 24.15+ (recommended) or Node.js 22.22.3+ for the current Nuxt dependency versions. Node 24.18 is suitable.
