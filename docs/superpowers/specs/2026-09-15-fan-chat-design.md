# Fan chat + paywall — design spec (2026-09-15)

Context: docs/context/*.md (brief, company, repo state, decisions, design tokens).
Budget: 6-7 hours. Demo: iOS simulator (+ iPhone if available). Android built, documented.

## 1. Scope
In: one fan→creator chat thread, paywall sheet, dev panel sheet, mock services, 3 focused tests,
perf measurement, README + AI.md. Out: creator side, media upload, other tabs (placeholders stay).

## 2. Folder layout
```
src/
  app/
    _layout.tsx            Stack; registers paywall + dev as formSheet routes; loads fonts; providers
    (tabs)/messages/index.tsx  -> renders ChatScreen (single thread)
    paywall.tsx            formSheet, detents [0.6, 0.9]
    dev.tsx                formSheet, detents [0.5, 0.9]
  features/chat/           ChatScreen, MessageList, MessageRow, Bubble, StatusLine, Composer, LockedComposer, Banner, ChatHeader
  features/billing/        PaywallSheet, ProductCard, EntitlementBadge
  features/devtools/       DevPanel
  components/              Avatar, Badge, PrimaryButton, IconButton, Pill, Text (token-aware)
  services/api/            ChatApi.ts, BillingApi.ts (interfaces + typed errors)
  services/mock/           mockChatServer.ts, naiveChatServer.ts (bug repro), mockPurchases.ts, mockBackendBilling.ts, faults.ts, historyGenerator.ts
  stores/                  chatStore, outboxStore, billingStore, connectivityStore
  workers/                 outboxDrainer.ts, syncWorker.ts
  hooks/                   useThread, useSend, useRetry, useEntitlement, usePurchase, useConnectivity
  storage/                 mmkv.ts (clientStorage, mockServerStorage — separate instances), zustandMmkv.ts
  theme/                   tokens.ts, typography.ts
  __tests__/               duplicateSend.test.ts, restartRecovery.test.ts, delayedConfirmation.test.ts
```

## 3. Domain model
```ts
type ClientId = string; type ServerId = string;
interface ServerMessage { id: ServerId; clientId?: ClientId; seq: number; authorId; text; createdAt; kind: 'text'|'gift'|'media' }
interface OutboxItem { clientId: ClientId; text; createdAt; status: 'pending'|'sending'|'failed'; error?: SendError; attempts: number }
type SendError = { code: 'NETWORK'|'RATE_LIMITED'|'PAYMENT_REQUIRED'|'BLOCKED'; recoverable: boolean; message: string }
interface Entitlement { productId; status: 'none'|'awaiting_confirmation'|'active'|'expired'; receiptId?; confirmedAt? }
```

## 4. Services (pure TS)
- `ChatApi`: `send({clientId,text})`, `sync(sinceSeq)`, `getPage(beforeSeq, limit)`.
- `MockChatServer`: persists `{messages: ServerMessage[], acceptedByClientId: Record<ClientId, ServerId>, nextSeq}` in mockServerStorage. `send` is idempotent: if clientId known → return existing message. Faults (from `faults.ts`, held in connectivityStore): `offline` → throw NETWORK; `dropNextResponse` → accept + persist, then throw NETWORK (the lost-response case); `failNextSend: 'RATE_LIMITED'|'BLOCKED'`; `latencyMs`.
- `NaiveChatServer`: same but no acceptedByClientId → reproduces duplicate. Used only by the failing test and dev panel toggle "use buggy server" for the walkthrough.
- `historyGenerator(seed, 50_000)`: deterministic (mulberry32), short texts, alternating authors, seeded into server store on first launch or reset.
- `MockPurchases` (`purchase(productId)`, `restore()`): outcome selected in dev panel: success | cancelled | failed | success-delayed-confirm. Returns `{receiptId}`.
- `MockBackendBilling` (`confirm(receiptId)`): resolves `active` after `confirmDelayMs` (0 or 5000), idempotent per receiptId.

## 5. Stores
- `connectivityStore`: `online`, fault flags, `setOnline`. Persisted (so force-quit while offline stays offline in demo).
- `outboxStore` (persisted, sync MMKV): `items: OutboxItem[]` in insertion order; `enqueue(text)` writes to storage *before* returning (MMKV set is sync; store persist middleware writes on every change); `markSending/markConfirmed(clientId)/markFailed`; `retry(clientId)`.
- `chatStore`: `byId: Record<ServerId, ServerMessage>`, `orderedIds` sorted by seq, `lastSeq`, `oldestLoadedSeq`, `hasMore`; `upsert(msgs[])` dedupes by id and re-sorts only if a new id is inserted (no jumps on repeats). Confirmed history not persisted (re-paged from server on launch) except `lastSeq`.
- `billingStore` (persisted): `entitlement`, `purchaseInFlight: boolean`, `processedReceipts: Set`; `startPurchase()` no-ops if in flight; on purchase success → `awaiting_confirmation` + call backend confirm; on confirm → `active` (dedupe by receiptId); failure/cancel → leave existing entitlement untouched.

## 6. Workers
- `outboxDrainer`: subscribes to connectivity + outbox. When online and no item is `sending`, take first `pending`, mark sending, `api.send`. Success → `chatStore.upsert(msg)`, remove from outbox. NETWORK error → back to pending (kept, will retry on reconnect; auto-retry with backoff up to 3 while online). Non-recoverable → failed with error.
- `syncWorker`: on online transition → `api.sync(lastSeq)` → upsert → then let drainer run. Guarantees incoming-first ordering after reconnect.

## 7. Thread composition (`useThread`)
`[...confirmed messages by seq ascending, ...outbox items in local order]` mapped to a `Row` union; list is inverted, so data is reversed once. Rows keyed by `serverId ?? clientId`. Day separators computed in the same pass. Pagination: `onEndReached` (top, since inverted) → `getPage(oldestLoadedSeq)` 50 at a time with a loading footer.

## 8. UI (see docs/context/04-design-tokens.md)
Header (back, "Chat with", kebab → dev panel; avatar/name/handle + EntitlementBadge or Subscribe pill) → Banner slot (offline / syncing / none) → MessageList (FlashList inverted) → Composer (or LockedComposer when not entitled) with counter + "Available messages" line. Keyboard via keyboard-controller `KeyboardAvoidingView` replacement; safe areas via safe-area-context. Reanimated: banner slide, bubble fade-in, send button press scale, status transitions; all gated on `useReducedMotion`.
Paywall route: product card, price, state pill, CTA (disabled + spinner while in flight), Restore, "Simulated billing" tag, error text. Dev route: switches for offline, drop next response, fail next send (rate-limited / blocked), inject 4 incoming, purchase outcome picker, confirm delay, buggy server toggle, Reset all (clears both storages + reseeds history).

## 9. Error handling
Typed `SendError` from services; stores map to UI copy: NETWORK "Waiting for connection", RATE_LIMITED "Too many messages, retry in a moment" (retry), PAYMENT_REQUIRED "Subscribe to send" (opens paywall), BLOCKED "You can't message this creator" (no retry). Purchase errors: cancelled → toast, failed → inline error + retry, confirmation timeout (>15s) → "Still confirming, we'll keep checking" and a manual "Check again".

## 10. Tests (Jest, jest-expo preset, MMKV mocked with in-memory Map)
1. `duplicateSend`: naive server + dropNextResponse → send → retry → expect thread length 2 (FAILS); same with MockChatServer → expect 1 (PASSES). Both assertions kept, naive one as `test.failing`.
2. `restartRecovery`: offline, enqueue 3 → new store instances over same storage → 3 pending in order → inject 4 incoming on server → go online → thread = history + 4 incoming + 3 sent, no dups, seq monotonic.
3. `delayedConfirmation`: purchase success with 5s confirm delay (fake timers) → entitlement `awaiting_confirmation`, composer locked → advance → `active`; duplicate confirm event → no change; then failed unrelated purchase → still `active`; double tap → one purchase call.

## 11. Performance plan
Release build on iOS simulator + device if available. Sequence: open thread, scroll up 10 pages, type 40 chars, send, repeat once. Measure: Xcode Instruments (Core Animation FPS, memory), Expo perf monitor JS FPS. Before/after candidate: MessageRow without memo and composer text in global store vs memoized row + local composer state. Record numbers in README; state simulator caveat.

## 12. Deliverables
README (bug, decisions, tests, perf, platform notes, time), AI.md, recordings list, upload-resume answer, store policy links section.

## 13. Optional phase (only after sections 1-12 are green; 30-45 min cap)
Static filler screens from `services/mock/fixtures.ts`, no stores, no tests:
- Dashboard "My Fan Suites": 3 creator cards (avatar, name, handle, status pill) → tap opens chat; "Recent activity" list (3 rows).
- Wallet: balance card (primaryTint), "Add funds" → "Simulated billing" toast; 5 transaction rows (subscription, gift, tip, refund in error color).
- More: profile row; settings list (Notifications, Privacy, Help, About). About: version, build type, "Reset demo data".
- Easter egg: `useSecretTap(5 taps / 1.5s)` on Dashboard logo text and About version row → formSheet card:
  avatar, "Next hire: Bogdan Egikov", one-liner, contact sledyuk@gmail.com, button "Email Bogdan" (mailto:sledyuk@gmail.com).
  Mentioned in README under "For fun". Submission goes to join@fansapi.com (README note only).
