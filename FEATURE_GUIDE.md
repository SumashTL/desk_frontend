# SumashDesk — Feature Guide

## Product boundary
Single-company WhatsApp customer communication workspace. The frontend currently runs with demo data and browser-local persistence. It does not connect to WhatsApp Cloud API or a live backend. AI and additional messaging channels are intentionally excluded.

## Customer Satisfaction (CSAT)

### Customer experience
- CSAT is rating-only. Do not ask for written comments or additional questions.
- Default method: a WhatsApp Flow with a single-choice rating input and five star-labelled options (⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐, ⭐⭐⭐⭐⭐). The customer stays inside WhatsApp and taps one choice, then submits.
- Fallback method: one native WhatsApp interactive reply message with three numbered reply buttons: `1`, `2`, `3`. WhatsApp interactive reply-button messages support up to three buttons.
- WhatsApp Flows support in-app form components such as single-choice inputs, but the platform documentation does not specify a dedicated native star-rating widget. Therefore the five-star experience is implemented as five selectable star-labelled choices, not a custom graphical star-picker. If a true star-picker is mandatory, use the three numbered native reply buttons instead or a hosted survey page.

### Automatic conversation workflow
1. Agent changes the conversation status to **Resolved** in Inbox.
2. If CSAT is enabled, the frontend demo creates one rating-request event for that conversation (one request per conversation by default).
3. The chosen mode is recorded: `flow5` (five star-labelled choices in a WhatsApp Flow) or `quick3` (three numbered reply buttons).
4. In production, Django sends the Flow/template or interactive message through WhatsApp Cloud API.
5. WhatsApp sends the customer's selection to the configured webhook. Django validates the response and stores rating, contact, conversation, assigned agent and timestamp.
6. CSAT reports calculate rating distribution, average rating, positive-rating percentage and low-rating review queue.

### Included in this frontend demo
- Automatic demo survey request event when an Inbox conversation changes to Resolved.
- One request per conversation, with duplicate prevention in local browser storage.
- CSAT enable/disable, automatic post-resolution request, rating method selector.
- Five-star Flow choice mode and three-button fallback mode.
- Rating-only feedback table, 1–5 distribution, average rating, 4–5-star satisfaction percentage and low-rating review status.
- No customer comment field or additional questions.
- Local persistence for settings and demo conversation events.

### WhatsApp production requirements
- Create and publish a Survey-category WhatsApp Flow in WhatsApp Manager, with one required single-choice field and five options labelled ⭐ through ⭐⭐⭐⭐⭐. Do not add comment or text fields.
- Configure the Flow ID and send it using the supported WhatsApp Flow message/template mechanism. A template is needed when sending outside the 24-hour customer-service window; within an open window, supported interactive messages can be used as permitted by the current WhatsApp rules.
- For the fallback, send a WhatsApp interactive button message with exactly three numbered reply buttons (`1`, `2`, `3`). Standard reply-button messages are limited to three buttons.
- Subscribe the app to inbound message / Flow completion webhooks. Store the Flow token or request ID against the conversation so a response is linked to the correct survey.
- Enforce one survey request per resolved conversation, handle retries idempotently, validate customer consent and suppress duplicate submissions.
- The **Send survey request** and resolve-triggered request in this frontend are demo-only queue events. They do not send a real WhatsApp message or receive a real WhatsApp response until a Django backend, Cloud API credentials, published Flow/template and webhook are configured.

### Reporting definition
- Five-point mode: average rating is out of 5; positive CSAT = percentage of responses rated 4 or 5.
- Three-button mode: store the response as 1, 2 or 3; configure the reporting denominator and positive threshold consistently (recommended positive = 3 only). Do not mix the two scales in the same aggregate without normalizing them.

## Customer 360° Profile

### Profile sections
- Identity: customer name, phone, email, location, preferred language, source and created date.
- Relationship: customer segment, active status, VIP marker, conversation count, last interaction and assigned agent.
- Consent: opt-in / opt-out state with a visible status and timeline event when changed.
- Organization: customer tags and internal team notes.
- Experience: satisfaction snapshot and recent activity timeline.
- Actions: create/edit customer, add tag, add internal note, update consent and export a selected profile as JSON.

### Data rules for a future backend
- Normalize phone numbers and enforce uniqueness at the server.
- Keep consent event history (timestamp, source, actor, purpose and evidence); do not overwrite history with a single boolean.
- Enforce opt-out suppression server-side before broadcast recipient creation.
- Restrict sensitive notes and exports by role.
- Link customer activity to stable contact, conversation, message, survey and team-member IDs.

## Follow-ups
- Create reminders with customer, task note, date, time and owner.
- Filter All, Due today, Overdue, Upcoming and Completed.
- Mark complete or delete; persist changes in browser storage.
- A production backend should calculate due/overdue status using the workspace timezone and store reminder events server-side.

## Shared UI / interaction rules
- Inbox keeps its dedicated three-pane layout.
- Other workspace pages use a consistent content width, outer padding, heading hierarchy, card radius, form height and button sizing.
- Sidebar remains the shared navigation shell and supports collapse.
- Light/dark theme is stored in browser local storage.
- Tables scroll horizontally on narrow screens; forms and cards reflow for mobile widths.
- Keyboard focus indicators are visible; controls have concise labels and action text.

## Other included modules
Inbox, Dashboard, Contacts, Broadcast, Quick Replies, Templates, Team Members, Reports and Settings. These modules use demo records and local browser state. WhatsApp message delivery, broadcast delivery metrics, agent presence, notifications, SLA enforcement and authentication are simulated until backend integration.
