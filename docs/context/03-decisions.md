# Decisions log (pairing session, 2026-09-15)

| # | Decision | Choice | Why |
|---|----------|--------|-----|
| 1 | Mock layer | In-process TS modules behind interfaces, own persisted storage (separate MMKV instance / key prefix) | Jest-testable, restart demo = new instance over same storage, no second process for reviewer |
| 2 | State + persistence | Zustand stores + react-native-mmkv | Sync writes make "persist before queued" trivial; fast paging; needs dev build (needed for honest perf anyway) |
| 3 | Demo platform | iOS simulator, real iPhone if available; Android built + documented | macOS host, Instruments/Perf Monitor |
| 4 | List | @shopify/flash-list v2 | maintainVisibleContentPosition, inverted chat, new-arch ready, good perf narrative |
| 5 | UI/animation | Reanimated 4 + StyleSheet + tokens file | worklets already installed; faithful to Figma; useReducedMotion |
| 6 | Tests | Jest via jest-expo, pure-logic tests on stores/mocks | 3 required tests: dup bug (fail->pass), restart recovery, delayed confirmation |
| 7 | Dev controls | Bottom sheet from chat header icon | Reachable mid-recording, uncut sequences |
| 8 | Scope | One chat thread, one paywall sheet, one dev panel; other tabs stay placeholders | 6-7h budget, correctness graded highest |
| 9 | Components | Own small component set on RN primitives + tokens; libs only for flash-list, keyboard-controller, reanimated, expo-image, lucide icons, expo-crypto | No design system exists; UI kit would fight the Tailwind-flavored Figma |
| 10 | Data flow | services (pure TS) -> Zustand stores -> workers (outbox drainer, sync) -> thin hooks -> components. No logic in components | Tests run in Jest with no React; restart test = fresh stores over same storage |
| 11 | Modals | expo-router Stack screens with presentation 'formSheet' (native sheets, detents) for paywall + dev panel | Zero deps, native feel, deep-linkable. Android: max 3 detents, no headers in sheets |
