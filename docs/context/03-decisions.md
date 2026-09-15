# Decisions log (pairing session, 2026-09-15)

| # | Decision | Choice | Why |
|---|----------|--------|-----|
| 1 | Mock layer | In-process TS modules behind interfaces, own persisted storage (separate MMKV instance / key prefix) | Jest-testable, restart demo = new instance over same storage, no second process for reviewer |
| 2 | State + persistence | MobX (mobx + mobx-react-lite) class stores + expo-sqlite/kv-store (sync API, bundled in Expo Go) | User preference for MobX; kv-store sync writes keep "persist before queued" trivial. MMKV v4 rejected: Nitro-based, not in Expo Go (verified 2026-09-15) |
| 3 | Demo platform | iOS simulator, real iPhone if available; Android built + documented | macOS host, Instruments/Perf Monitor |
| 4 | List | @legendapp/list (LegendList 3.x) | Pure TS, Expo Go OK, alignItemsAtEnd + maintainScrollAtEnd + maintainVisibleContentPosition, no inverted hacks. FlashList v2 rejected: native, not in Expo Go |
| 5 | UI/animation | Reanimated 4 + StyleSheet + tokens file | worklets already installed; faithful to Figma; useReducedMotion |
| 6 | Tests | Jest via jest-expo, pure-logic tests on stores/mocks | 3 required tests: dup bug (fail->pass), restart recovery, delayed confirmation |
| 7 | Dev controls | Bottom sheet from chat header icon | Reachable mid-recording, uncut sequences |
| 8 | Scope | One chat thread, one paywall sheet, one dev panel; other tabs stay placeholders | 6-7h budget, correctness graded highest |
| 9 | Components | Own small component set on RN primitives + tokens; libs only for flash-list, keyboard-controller, reanimated, expo-image, lucide icons, expo-crypto | No design system exists; UI kit would fight the Tailwind-flavored Figma |
| 10 | Data flow | services (pure TS) -> Zustand stores -> workers (outbox drainer, sync) -> thin hooks -> components. No logic in components | Tests run in Jest with no React; restart test = fresh stores over same storage |
| 11 | Modals | expo-router Stack screens with presentation 'formSheet' (native sheets, detents) for paywall + dev panel | Zero deps, native feel, deep-linkable. Android: max 3 detents, no headers in sheets |
| 12 | Runtime | Expo Go for dev + demo; one release build only for perf numbers | Reviewer runs it instantly; Expo Go cannot produce release numbers |
| 13 | Keyboard | RN KeyboardAvoidingView + safe-area insets | keyboard-controller is native, not in Expo Go |
| 14 | History content | Rick and Morty parody: creator "Rick Sanchez" @rickc137, fan = Morty. ~60 paraphrased lines cycled with seeded variation | Mockup avatar is already Morty; joke thread shows the app is alive. Own words + generated avatars only |
| 15 | Paywall model (creator app) | **FanSuite Pro** creator plan, ʂ 40/month (Schmeckles, ≈ $9.99 hint), gates broadcast to many fans + AI bio. Dashboard plan card, paywall sheet, Wallet = earnings in Schmeckles | Brief's paywall was fan-side; on the creator app a SaaS plan keeps every required mechanic (purchase/cancel/fail/restore, delayed backend confirmation, dedupe, no revoke on unrelated failure) with a real feature to gate |
| 16 | Currency | Schmeckles, written as a code after the amount (`40 SCH`, no real glyph exists); "Simulated billing" labelled on paywall and wallet | Rick and Morty metaverse; makes clear no real money |
