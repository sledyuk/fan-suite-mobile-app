# FanSuite chat task

An Expo SDK 57 / React Native / TypeScript fan-chat prototype with an offline outbox, an idempotent local chat server, paginated history, and a simulated subscription paywall.

The screen started from the provided Figma design and was refined for this implementation with an improved Liquid Glass visual direction, including translucent surfaces, grouped controls, clearer state treatments, and platform-appropriate spacing and motion.

## Run locally

```bash
npm install
npx expo start
```

Then open the project in an iOS Simulator, Android emulator, development build, or Expo Go where the installed native modules are supported. Platform commands are also available:

```bash
npm run ios
npm run android
npm run web
```

No real store account, backend, or private credential is required. The mock uses separate client and server storage namespaces in tests; the app uses local key-value storage.

## What is implemented

### Chat and recovery

- Sending writes the message to `OutboxStore` storage synchronously before `enqueue` returns. If that write throws, the item is rolled back, the composer keeps the draft and shows an error. Each item receives a stable `clientId` from `expo-crypto`.
- Pending outbox items survive a force-quit/restart. A `sending` item is reopened as `pending` during hydration, and any backoff deadline is cleared.
- `MockChatServer` persists accepted messages and its `clientId -> server message` map separately from the client outbox, committed together in a single storage write. A retry of an accepted send returns the original server message instead of appending another one. Only the accepted tail is serialized; the deterministic 50,000-message seed is regenerated on load.
- Reconnect, and a cold start while already online, synchronize every chat that has queued sends (not only the open thread) before draining, so the server assigns the final order and missed incoming messages appear first.
- Network retries wait for a per-item backoff deadline (0.5 s, 1.5 s, 4 s) before the item is marked failed. Once the mock backend confirms paid access, sends that failed with `PAYMENT_REQUIRED` are requeued with their original `clientId`.
- The client upserts by server ID and retires an outbox item by `clientId`; repeated sync responses and a response/sync race do not create duplicate bubbles or reorder an unchanged thread.
- Sends are drained one at a time in local order. Recoverable failures can be retried; a non-recoverable blocked or payment-required failure remains visible with its text and explanation. A failed item blocks later sends in the same chat until it is retried or discarded.
- History is loaded in pages of 50 through `LegendList`. Seeded demo mode creates deterministic 50,000-message histories.
- The composer supports multiline text, a length limit, quick emoji actions, photo/video attachment selection, safe-area padding, keyboard avoidance, and reduced-motion-aware list transitions.

### Reproducing the duplicate-send scenario

Open a chat, open the debug controls, enable **Buggy server**, enable **Drop next response**, and send a message. The naive server accepts the message but loses the response; retrying creates a second server message because it does not remember the client ID.

Turn **Buggy server** off and repeat the scenario. The fixed mock remembers the accepted `clientId` and returns the original message on retry, leaving one copy in the thread. The debug sheet also supports offline mode, four incoming messages, typed send failures, reset, and demo seeding.

### Payments

The paywall is deliberately labelled **Simulated billing — no real charge**. It displays the product, monthly price, perks, and these states:

- purchase success, followed by backend confirmation;
- cancellation;
- store failure;
- delayed backend confirmation;
- restoration of the last simulated purchase.

`BillingStore` keeps purchase results separate from backend entitlement confirmation. Access remains unavailable while confirmation is pending, duplicate purchase taps are ignored while a flow is in flight, and an unrelated cancellation/failure does not revoke an already-active entitlement. Confirmation receipts are de-duplicated and the awaiting state is persisted across restart.

In production, the purchase service would be backed by StoreKit and Google Play Billing. The receipt/token would be sent to a backend, validated against the store, and associated with the account. The backend—not the client—would own entitlement state and handle renewal, expiry, refunds, revocation, grace periods, and billing retries.

## Verification

```bash
npm test -- --runInBand
npm run typecheck
git diff --check
```

Current automated result: **10 Jest suites, 34 tests passed**, TypeScript typecheck passed, and `git diff --check` passed.

Demo platform: iOS. Tested manually on an iPhone running iOS 27 (exact model: _fill in before sending_) and on the iOS Simulator. Android: run `npm run android`; it was opened briefly but not functionally tested.

Time spent: _fill in before sending_.

Focused coverage includes:

- lost response + retry against naive and idempotent servers;
- accepted-message persistence across a server instance restart;
- three pending messages surviving an app restart, four incoming messages recovered first, ordered drain, and no duplicates;
- retryable versus non-retryable send failures and backoff;
- duplicate suppression when sync races a send;
- delayed purchase confirmation, duplicate events, cancellation/failure preservation, restore, and billing restart recovery;
- deterministic 50,000-message generation and backwards pagination;
- outbox persistence and thread ordering;
- one regression test per code-review finding below (`src/__tests__/reviewRegressions.test.ts`).

## Review findings and fixes

An external code review of the first submission candidate reproduced five message-safety defects with targeted checks. Each is fixed and covered by a test that failed before the change:

1. **Failed persistence still reported a message as queued.** Persistence ran in a MobX reaction whose errors never reached the sender. `enqueue` now writes synchronously and throws on failure; the composer keeps the text and shows an error.
2. **Server acceptance and duplicate protection were two writes.** An interruption between them left an accepted message without its `clientId` mapping, so a restart plus retry produced two copies. Message and mapping are now committed in one write.
3. **Reconnect skipped chats that had not been reopened.** Only instantiated threads were synchronized, so draining from the chat list could send before recovering incoming messages. Sync now covers every chat with outbox items and also runs on cold start while online.
4. **Subscribing did not unblock a payment-required message.** The failed item stayed failed after confirmation and blocked the chat. Confirmed access now requeues those items; tapping one retries instead of reopening the paywall.
5. **Retry backoff was bypassed.** Marking the item pending triggered the drain reaction immediately. The deadline now lives on the item and the drainer honours it.
6. **Every accepted send serialized the full 50,000-message history.** The server now persists only the accepted tail plus seed parameters and regenerates the seed on load. This removed the largest synchronous JSON write from the send path; frame-time evidence on a device is still owed (see below).

The broadcast screen previously kept sent messages in component state only. It now enqueues one outbox item per recipient, so broadcasts are persisted, drained, retried and de-duplicated like any other send.

## How this application was built

### Design direction

The task did not ask for a pixel-perfect reproduction, and the Figma file covers only the chat screen. I used it for structure, spacing and typography, then chose a Liquid Glass direction for the shell: translucent tab bar and header controls (`expo-glass-effect`), grouped controls, soft tinted surfaces and short, reduced-motion-aware transitions. This matches where new iOS apps and recent web apps are heading and keeps the missing states (offline, pending, failed, paywall) visually consistent with the designed screen.

### Priorities

Most of the time went into the message path, because that is where the task's correctness requirements live: the persisted outbox, stable client IDs, idempotent server acceptance, reconnect recovery order, retry backoff and paid-access blocking. Around it I built the screens needed to make the flow feel like a real product: a chat list whose rows show unread count, read/delivered/failed state of my last message, online presence and swipe actions; a fan details sheet; a simulated wallet; a paywall; and a debug console that drives every failure case.

### Demo world

The demo data is a Rick and Morty universe: fans such as Morty Smith and Birdperson, message scripts in their voice, and Schmeckles (SCH) as the currency in the wallet and paywall. The 50,000-message histories are generated deterministically from a seed per chat, so every run and every reviewer sees the same thread.

### How the server and mock data are emulated

There is no network. `MockChatServer` implements the same `ChatApi` interface a real backend client would, and lives in the app process behind a separate storage namespace (`server:`) from the client (`client:`), so "server state" and "device state" can be inspected and reset independently and survive a force-quit the same way a real backend would.

- **History**: a deterministic generator (`historyGenerator.ts`) produces the seeded messages on demand. The server persists only the accepted tail, its `clientId -> message` map and the seed parameters, and regenerates the seed on load.
- **Send**: assigns the final `seq` and server ID, remembers the `clientId`, and returns the existing message if the same `clientId` is sent again.
- **Sync and pages**: `sync(chatId, sinceSeq)` returns everything after the client's cursor; `getPage` pages backwards for the virtualized list.
- **Faults**: a small `Faults` object (offline, drop next response, fail next send with a typed error, latency) is toggled from the debug console and checked by the server on every call. A `NaiveChatServer` subclass without the client-ID map reproduces the duplicate bug.
- **Billing**: `MockPurchases` plays the store (purchase, cancel, fail, restore) and `MockBackendBilling` plays the backend that confirms entitlement, optionally with a delay, so the two are never conflated.

### Library choices

- **MobX** for stores and workers: reactions drive the outbox drainer and sync worker, which keeps the recovery logic testable without React.
- **`@legendapp/list`** for the virtualized thread and chat list.
- **`expo-sqlite/kv-store`** for synchronous durable storage on both client and server namespaces.
- Everything runs in **Expo Go**, so no development build is required to review it. For that reason I did not use `react-native-mmkv` or FlashList's native build, both of which I would prefer in production for storage throughput and list performance.

### Platform status

Developed and tested on an iPhone (iOS 27) and the iOS Simulator. The app also runs on Android, but the tab bar, safe areas and glass surfaces are tuned for iOS and have not been adapted or verified there. Search currently matches fan name, handle and the last message of each chat only; it does not search full message history.

## Requirement status and limitations

The core implementation and focused automated tests for message safety, restart recovery, payment confirmation, restoration, failure states, pagination, and reduced motion are complete.

The following submission deliverables are not represented as completed in this repository:

- no repeatable real-device/simulator performance profile with frame timing, dropped frames, and memory measurements;
- no before/after performance measurement;
- no recording of the recovery sequences;
- iPhone/iOS 27 was manually tested and was the primary target. Android was opened briefly but not functionally tested, and its UI has not been specifically adapted. The web version was not tested;
- no production billing, backend, moderation system, or real media upload service.

The tests use Jest and deterministic mock storage, so they validate state transitions and ordering rules but are not proof of real-phone performance. Existing MobX strict-mode messages emitted by the test environment do not fail the test command.

## Large media upload design

Uploads should be represented by a durable local job containing an upload ID, file URI, size, checksum, chunk size, completed-part map, and retry metadata. The client would ask the backend for an upload session, upload chunks with idempotent part numbers, persist each acknowledged part, and resume missing parts after a network interruption or app restart. The backend would finalize only after validating all parts and the checksum.

Backgrounding should pause or hand the job to an OS-supported background transfer facility and continue within platform limits. A user force-quit/force-stop should be treated as an explicit interruption: persist the job, stop active work, and offer resume on the next launch rather than assuming the upload continues.

## App-store considerations

This prototype includes direct fan/creator messaging and creator-provided content. A production app would need clear terms and privacy disclosures, content filtering/moderation, reporting, blocking, timely handling of reports, age/content controls where applicable, and published support contact information.

- [Apple App Review Guidelines — User-Generated Content and In-App Purchase](https://developer.apple.com/app-store/review/guidelines/) (Guidelines 1.2 and 3.1.1)
- [Google Play User-Generated Content policy](https://support.google.com/googleplay/android-developer/answer/9876937)
- [Google Play Payments policy](https://support.google.com/googleplay/android-developer/answer/10281818)

The monthly Pro entitlement unlocks digital app functionality, so the production mobile flow should use Apple In-App Purchase or Google Play Billing as applicable, send the transaction to the backend for validation, and avoid granting access from an unverified client-only result. Any web/alternative billing flow would require a separate policy and regional review.

## AI use and scope

Claude Code and Codex were used as development assistants for different parts of the task. Their contributions included generating and refining implementation code, discussing architecture and recovery/payment decisions, reviewing and structuring documentation, and iterating on UI/UX details such as states, accessibility, keyboard handling, and interaction flows.

All generated output was reviewed and adapted during implementation. The final behavior was checked against the task requirements and verified with the focused tests and typecheck. Agent/process notes and generated working documents are intentionally not retained in this branch. The source of truth is the code, tests, and this README.
