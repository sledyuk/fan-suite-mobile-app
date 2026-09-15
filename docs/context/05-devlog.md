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
- Known deviation: native tab bar stays visible on the thread (iOS 26 native tabs minimize it on scroll). Mobile mockup hides it. Revisit if time allows.
