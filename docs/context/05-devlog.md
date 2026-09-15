# Dev log

## 2026-09-15 — Step 1: basic message list
- Environment: macOS, Xcode iOS Simulator **iPhone 18 Pro, iOS 27.0**, Expo Go (SDK 57), Metro dev server. Android not run yet.
- Installed: @legendapp/list 3.3, expo-image, expo-font + Inter, lucide-react-native + react-native-svg, reanimated 4.5, expo-splash-screen; jest-expo 57 (dev).
- Verified in Expo Go: Messages tab opens at the bottom of a 50k-message seeded thread; incoming/outgoing bubbles, gift bubble, header and badge match the mockup geometry.
- Fixes found by looking at the screen: last rows hid behind the native tab bar → `contentInsetAdjustmentBehavior="automatic"` + safe-area bottom padding; history dates ended in June → generator now shifts timestamps so the newest message sits on a fixed anchor (still deterministic).
- Observation: simulator locale renders times 24h ("15:00") while the mockup shows "5:40 am"; formatting is locale-aware on purpose.
- Not yet verified by hand: scroll-up paging smoothness (needs a finger on the simulator).

## 2026-09-15 — Step 2: chat list + navigation
- Naming decided with Bogdan: tab **Chats** (mockup sidebar said "Messages", list title "Chats"; we unified on Chats). Routes: `(tabs)/chats/index` list, `(tabs)/chats/[chatId]` thread, nested Stack in the tab.
- 10 parody conversations in `services/mock/conversations.ts`, each with its own history seed; opening a row shows a distinct deterministic 50k thread.
- `Avatar` now falls back to initials + name-hashed color when a creator has no PNG.
- Jest: `@/assets/*` alias had to be mapped before `@/*` (jest-expo only derives the first alias from tsconfig).
- Typed routes: after renaming the folder, `tsc` fails until Metro regenerates `.expo/types/router.d.ts` — not a code error.
- Thread route moved to the root Stack (`app/chat/[chatId]`) so it is pushed over the tab group and the tab bar is hidden, matching the mobile mockup. The nested stack inside the tab was removed.

## 2026-09-15 — Step 3: creator-side app, fan details sheet
- Decision (Bogdan): this is the **creator** app, not the fan app. `ME` is the creator (Morty, per Bogdan); conversations are with fans (Rick first); `mine` = creator messages. Creator mockups now drive the UI (Chats "+" button, "Full Details" header button, emoji quick-bar later).
- Fan Details opens as a native iOS page sheet via `Stack.Screen options={{ presentation: 'modal' }}` on `app/fan/[fanId]`. Read-only: the creator cannot edit fan details, so no pencil icons.
- Fan profile data lives on each conversation fixture (`FanProfile`): bio, location, suite, rebill, presence, buying power, note.
- Open question parked: the brief's paywall was written from the fan side; on the creator app "paid access" needs a rethink before that step.
- Investigated "modal should show dark card-stack like the Expo docs video": that video is iOS 18. On iOS 26/27 UIKit's page sheet shrinks the parent only slightly and the sheet covers it; the grey strip above the sheet is the *dimmed parent screen*, not a backdrop, so there is no black region to colour. Tried root background black (expo-system-ui) and dark appearance: no effect, reverted. Options: accept platform style, or build a custom card-stack (transparent modal + reanimated scaling of the navigator).
- Experiment: chat + fan routes in their own nested Stack group. Result: backdrop identical (grey); and deep-linking to the fan sheet from the tabs rendered it as a pushed screen (first route of the nested stack cannot be modal). Reverted to the flat root Stack. Backdrop colour is a native window property → dev-build config plugin later.

## 2026-09-15 — Step 4: iOS 26 navigation (Liquid Glass)
- Chats tab: nested Stack only for the native header (title + glass "new message" button via `headerRight` + `expo-glass-effect` `GlassView`). Thread still lives in the root stack so the tab bar hides.
- Search moved to its own tab with `role="search"`: iOS 26 splits it into the round glass button; opening it morphs the tab bar into the native `headerSearchBarOptions` field. Searches name, handle and last message.
- `NativeTabs minimizeBehavior="onScrollDown"`, unread badge on Chats.
- `GlassIconButton`: GlassView on iOS 26+, filled circle fallback elsewhere (Android / iOS ≤18).
- Fallback note: on Android and iOS 18 the header is the plain native bar; still correct, just not glass.
- Chats list vs Figma: added filter + plus glass header buttons (iOS 26 merges them into one capsule) and the 20pt "last sender" avatar per row. The two right-hand dots are undefined in Figma (same pattern on every row); implemented as top = unread, bottom = online. Documented as an assumption.
- Chat row states agreed via artifact (docs/context/07-chat-row-states.html, https://claude.ai/artifact/KzNk6SJrtxDdTYRpeUUJfi): right column = time above, one mark below. Fan-sent: unread count badge or nothing. Creator-sent ("You:"): sending clock / delivered check / seen = fan avatar / failed alert with "Not sent ·" red preview. Presence dot independent. Conversation model now carries `last {text, from, at, status}` + `unreadCount`; time helpers moved to `lib/time.ts`.
- Avatars now come from the public Rick and Morty API (`rmAvatar(id)`), cached memory+disk by expo-image, drawn over an initials placeholder so first paint/offline still shows something. Gearhead is listed there as "Revolio Clockberg Jr." (id 282). Generated PNGs removed.
- Chats rows: handle removed (kept in header/details). Swipe right = Pin/Unpin, swipe left = Read/Unread + Mute/Unmute via RNGH `ReanimatedSwipeable`; pinned rows sort first with a pin mark, muted rows show a bell-off. Filter header button removed (behaviour undefined). Pull-to-refresh via `useConversations` (700 ms simulated). `recycleItems` off for this 10-row list so swipe state never leaks between rows.

## 2026-09-15 — Step 5: New message flow
- `/new-message` modal with its own Stack: picker (search, FanSuite rows with fan counts, fan rows with verified tick + checkbox, selected = primary border/tint, floating CTA "Start Chat" vs "Message to (N) Users") → `broadcast` ("Message to (N) users", recipient chips, hint, sent bubbles, Composer). Suites expand to their fan count.
- Single fan → dismiss modal and push the thread. Broadcast send is local for now; the outbox step turns it into N queued sends with their own client IDs.
- New shared components: `Composer` (draft is local state on purpose), `Checkbox`, `PrimaryButton`; `ModalLayout` gained `onBack` for modal-internal stacks.

## 2026-09-15 — Step 6: outbox, mock server, thread sending
- Storage: `expo-sqlite/kv-store` behind `KeyValueStorage`; `client:` and `server:` namespaces; `MemoryKV` for tests.
- `MockChatServer` (idempotent on clientId, persists per thread) + `NaiveChatServer` (the bug). Test `duplicateSend.test.ts`: `test.failing` on the naive server, passing on the fix; raw failure output kept in `docs/evidence/duplicate-send-before-fix.txt`.
- MobX stores: Connectivity (persisted), Outbox (persisted, sync write before "queued"; `sending` → `pending` on hydrate), ChatStore/ThreadState (upsert by id, seq order, no reorder on repeats). `persistSlice` = hydrate + reaction.
- Workers: drainer (one at a time, local order, backoff 0.5/1.5/4 s then failed-recoverable; typed errors → failed) and reconnect sync (registered first, sets `syncing` so incoming get lower seq than flushed sends). `restartRecovery.test.ts` covers the brief's 3-pending / 4-incoming / restart scenario and lost-response retry end to end.
- Thread UI: outbox bubbles (dimmed "Sending…", failed with reason + Retry / Subscribe / Delete), Banner (offline amber / syncing), ThreadComposer (emoji quick-bar, attach, 0/400), reduced-motion aware entering animations. `MessageRow` = memo + observer.
- Dev sheet (`/dev`, form sheet): offline, drop next response, slow network, buggy server, fail-next segmented, inject 4 incoming, status, reset all.
- Jest: mobx is ESM → added to transformIgnorePatterns allowlist.

## 2026-09-15 — Step 7: payments and paid access
- Billing layer: `PurchaseService` (MockPurchases: instant outcome from dev sheet, remembers receipt for restore) and `BackendBilling` (MockBackendBilling: idempotent per receipt, configurable delay). `BillingStore`: one flow at a time, `awaiting_confirmation` until backend confirms, dedupe by receipt, unrelated cancel/fail never revoke, awaiting survives restart and re-checks on launch. `delayedConfirmation.test.ts` (3 tests).
- UI: `/paywall` sheet (product card in ʂ, perks, honest state pills incl. "Check again" after 8 s, Subscribe busy/disabled, Restore, simulated-billing legal), Dashboard `PlanCard` (Free / Confirming… / Pro renews), Wallet (balance, pending payout, simulated payout, transactions with refund in red), broadcast CTA becomes "Upgrade to message (N) users" without Pro. Dev sheet: next purchase outcome (delayed = 6 s).
- Dashboard and Wallet tabs got native glass headers via nested Stacks (trigger names `dashboard`, `wallet`).
- Simplified mocks per Bogdan: no artificial store latency; only the backend confirm delay is configurable.

## 2026-09-15 — Step 8: empty vs seeded account, debug everywhere
- `DemoDataStore` (persisted): `seeded`, conversations (pins/read/mute now persist), wallet. Fresh install = empty account; `container.seedDemo()` fills fixtures and lets the mock server generate 50k history per thread (`seedCount` is now a function of `seeded`); `resetAll()` returns to empty.
- All screens read the store (observer): Chats, Search, New message (suites derived from current fans), Broadcast, Dashboard, Wallet, routes `chat/[id]` and `fan/[id]`, tab badge.
- `EmptyState` component with a dev-only "Load demo data" button; `DebugButton` (glass bug icon) in every tab header; dev sheet has Seed / Reset to empty at the top and shows account state.
- More → "Reset to empty account" with confirm alert.
