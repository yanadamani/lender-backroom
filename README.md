# Oro Lender Dataroom — Scaffold

This is the framework for the lender dataroom, built ahead of the real data
catalog. Access control (auth, OTP, per-lender scoping enforcement) is
**deliberately left out** of this pass — see "What's NOT here" below.

## What this is

- `app/page.js` — the dataroom home: cards grouped by category, rendered from
  `lib/cards.js`. Currently shows **every** card to **every** visitor.
- `app/card/[cardId]/page.js` — card detail view. Loads a card's data via its
  `fetchFn` and renders it based on `type` (`metric` / `table` / `list`).
- `app/admin/page.js` — admin shell for managing lenders and which cards each
  lender can see. **In-memory only right now** — resets on refresh, no
  database, no login required to reach it.
- `lib/cards.js` — the card registry. This is the key abstraction: each card
  is `{ id, title, description, category, type, fetchFn }`. Every `fetchFn`
  currently returns mock data after a short delay.
- `lib/firebase.js` — placeholder Firebase config, unused until env vars are
  set. Not wired to anything yet.

## What's NOT here (by request, for this pass)

- No login, OTP, or magic-link flow
- No real session/token model
- No enforcement of lender → card permissions on the dataroom side (the admin
  panel lets you *set* permissions, but the dataroom itself doesn't check
  them yet — everyone sees everything)
- No Firestore/DB persistence — lenders and permissions reset on every
  refresh
- No access logs

These map directly to Section 3 (Access Model) of the initial plan sheet and
should be built once we're ready to layer access control back in.

## What to change once the data catalog is known

Only `lib/cards.js` needs new entries. For each real card:

1. Add an entry to `CARD_REGISTRY` with a real `id`, `title`, `description`,
   `category`, and `type` (`metric` / `table` / `list` — or a new type, with
   a matching branch added to `components/CardData.js`).
2. Replace `fetchFn` with a real call — e.g. a Metabase query, a call to an
   internal API route, or a Firestore read — instead of `mockDelay(...)`.

Nothing in `app/page.js`, `app/card/[cardId]/page.js`, or the admin panel
needs to change for this. That's the point of the abstraction.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
```

```bash
npm run build && npm run start   # production build
```

## Suggested next steps (in order)

1. Bring in the real card catalog (from lender request emails) and replace
   the six mock cards in `lib/cards.js` with the real list — metadata first,
   `fetchFn` can stay mocked until the source system is picked.
2. Decide the source system per card (Metabase / prod DB / aggregation
   cache) and wire up real `fetchFn`s one at a time.
3. Re-introduce access control: Firebase Auth (email OTP), Firestore-backed
   `lenders` / `lender_card_permissions` / `access_logs` collections, and
   enforce permissions on `app/page.js` and `app/card/[cardId]/page.js`
   instead of showing every card to everyone.
4. Move the admin panel's in-memory state to Firestore so it persists.
