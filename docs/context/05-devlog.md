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
- Fan Details opens as a native iOS page sheet via `Stack.Screen options={{ presentation: 'modal' }}` on `app/fan/[fanId]`. Read-only; pencils are affordances only.
- Fan profile data lives on each conversation fixture (`FanProfile`): bio, location, suite, rebill, presence, buying power, note.
- Open question parked: the brief's paywall was written from the fan side; on the creator app "paid access" needs a rethink before that step.
