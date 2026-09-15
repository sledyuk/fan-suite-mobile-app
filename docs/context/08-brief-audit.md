# Brief audit — 2026-09-15 (end of day 1)

Legend: ✅ done and verified · 🟡 done, needs a human check or polish · ❌ not done

## 1. Keep messages safe
| Requirement | Status | Evidence |
|---|---|---|
| Reproduce duplicate (lost response + retry), show cause, fix | ✅ | `NaiveChatServer` (no idempotency key) vs `MockChatServer` (acceptedByClientId). `duplicateSend.test.ts`: `test.failing` on naive, passes on fix; raw failure output in `docs/evidence/`. Live: dev "Buggy server" + "Drop next response" → 2 copies (verified in SQLite). |
| Persist pending before "queued"; stable client ID across retries/restarts | ✅ | `OutboxStore` writes synchronously via MobX reaction → `expo-sqlite/kv-store`; UUID from `expo-crypto`; hydrate maps `sending`→`pending`. `stores.test.ts`. |
| Mock remembers accepted client IDs, returns existing message; persists separately from client queue | ✅ | `server:` vs `client:` namespaces (`NamespacedKV`), `storage.test.ts`; restart test in `duplicateSend.test.ts`. |
| Offline → send 3, shown immediately with waiting status | ✅ | Dimmed bubble + clock "Sending…", amber offline banner. Verified via scripted run + SQLite. |
| Force-quit, reopen → all 3 still waiting | ✅ | `restartRecovery.test.ts`; live: connectivity persisted, outbox persisted, cached recent history shown. (Visual check blocked by Expo Go onboarding sheet; data verified.) |
| 4 incoming while offline → reconnect → recover, then send pending, no duplicates | ✅ | `syncWorker` registered before drainer, `syncing` guard; SQLite showed incoming seq 50002-50005 before sends 50006-50008. Test asserts `[i1..i4, a, b, c]`. |
| Accepted send + lost response → retry → one copy | ✅ | Test + live SQLite (1 copy). |
| Failed sends shown clearly, text preserved; retry for recoverable; explain others | ✅ | Red "!" badge, "Not delivered · Tap to retry / Tap to subscribe / <reason>", swipe-right Delete. RATE_LIMITED/NETWORK recoverable; BLOCKED/PAYMENT_REQUIRED explained. |
| Server assigns final order; local order kept until confirmed; repeats don't add copies or jump | ✅ | `ThreadState.upsert` (dedupe by id, seq sort, same array ref on repeats — tested); drainer blocks a chat's queue behind a failed item (test). |
| Focused restart-recovery test | ✅ | `restartRecovery.test.ts` (3 tests). |

## 2. Payments and paid access (creator plan "FanSuite Pro", Schmeckles)
| Requirement | Status | Evidence |
|---|---|---|
| Paywall with mock purchase service; purchase result separate from backend confirmation; labelled simulated | ✅ | `MockPurchases` (store) vs `MockBackendBilling` (validation), `BillingStore`; "Simulated billing" on paywall + wallet. |
| Product, price, purchase state; no duplicate flows on repeated taps | ✅ | Paywall card, busy button, `purchaseInFlight` guard (tested). |
| Demonstrate purchase / cancel / failure / restore | 🟡 | All four wired via dev "Next purchase outcome"; tests cover them; **not yet recorded on video**. |
| Success while confirmation pending shown honestly; access only on backend confirm | ✅ | Amber "Confirming…" pill on paywall + Dashboard card; `isActive` only after confirm (test). |
| Repeated events no duplicate effects; unrelated failure preserves valid access | ✅ | `processedReceipts` dedupe; tests. |
| Test for delayed confirmation | ✅ | `delayedConfirmation.test.ts` (3 tests incl. restart of `awaiting_confirmation`). |
| Explain store billing, backend validation, expiry/refunds | ❌ | README section not written yet (notes exist in plan Task 12). |

## 3. Pleasant screen + measurement
| Requirement | Status | Evidence |
|---|---|---|
| Repeatable 50k history, pagination, virtualized list | ✅ | `generateHistory` (mulberry32, tested), `getPage` 50/page, LegendList (`alignItemsAtEnd`, `maintainVisibleContentPosition`, recycling), lazy per-thread creation. |
| Scrolling and typing responsive | 🟡 | Composer draft is local state; rows memo+observer. **Not measured yet.** |
| Failure states designed with care | ✅ | Offline/syncing banners, pending/failed bubbles, list-row marks (spec artifact `07-chat-row-states.html`), empty states. |
| Transitions/animations, reduced motion | ✅ | Reanimated FadeIn/FadeInDown/FadeOut, swipe actions; own `useReducedMotion` gates all of it. |
| Profile scroll-and-type: build mode, frames, memory; one bottleneck before/after | ❌ | Needs the release/dev build (`expo run:ios --configuration Release`) + Instruments. Sequence and before/after plan exist (plan Task 11). |

## Cross-cutting from the brief
| Item | Status |
|---|---|
| Reset action + failure controls | ✅ dev sheet on every tab + thread; `run=` deep-link actions for scripting |
| Figma followed where it covers; missing states designed | ✅ tokens measured from mockups; iOS 26 conventions doc |
| Keyboard, safe areas, accessibility | 🟡 KAV + insets done; a11y labels on controls; **keyboard behaviour not hand-tested** |
| Platform/device statement, other-platform instructions | ❌ README |
| Recording of scenarios (uncut) | ❌ |
| README (bug, decisions, tests, perf, limits, time) | ❌ (devlog + decisions + spec are the raw material) |
| AI.md | ❌ |
| Media-upload resume paragraph | ❌ |
| App Store / Google Play rules with links | ❌ |

## Implemented beyond the brief (creator-app framing agreed with Bogdan)
- Chats list with swipe actions (pin/read/mute), pull-to-refresh, unread badge, Liquid Glass headers, native search tab, tab minimize.
- Fan details sheet, New message picker + separate-message broadcast (local send only), Dashboard, Wallet, More, hire-me easter egg.
- Empty vs seeded account (`DemoDataStore`), Rick & Morty API avatars, list-row state sync with threads.
- Scripted dev actions via deep links; SQLite-based verification.

## Known gaps / risks
- Broadcast send is local; should enqueue N outbox items (small).
- Day separators rarely visible (5-min gaps) until seed dialogues span days.
- `useReducedMotion` from Reanimated crashed in Expo Go → replaced; root cause not investigated.
- Expo Go onboarding sheet blocks screenshots on cold launch; tap Continue once.
- Black modal backdrop on iOS 26 needs a dev-build config plugin (documented).
