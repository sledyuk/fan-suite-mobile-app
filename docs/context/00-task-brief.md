# Task brief (verbatim summary)

Build and debug a fan chat screen in Expo, React Native and TypeScript. Keep messages safe when
the connection drops, handle paid access correctly, feel good to use. 6-7 hours incl. setup.
Working code + evidence of testing + clear explanation of decisions. AI allowed, must explain everything.

## Scope
- One chat screen + simple subscription paywall + small local mock for chat and purchases.
- No backend, no store accounts, no real payments.
- Reset action + simple controls (dev panel) for failure cases.
- Pick iOS or Android for demo; document device/simulator + OS. Instructions for other platform.
- Figma: https://www.figma.com/design/yEtnomNqQKGtO42UB0XJzY/FanSuite--React-Native-Task-?node-id=1-9
  Design missing offline/pending/failed/purchase states ourselves.

## 1. Keep messages safe (30%)
- Reproduce duplicate: send reaches server, response lost, retry -> message twice. Show cause, fix.
  Test that fails before fix, passes after.
- Persist pending messages BEFORE treating as queued. Stable client ID surviving retries + restarts.
- Mock service remembers accepted client IDs; returns existing message on retried send.
  Mock's accepted messages persisted separately from client's pending queue.
- Scenarios:
  - Offline, send 3 -> shown immediately with waiting status.
  - Force-quit, reopen -> all 3 still waiting.
  - Simulate 4 incoming while offline. Reconnect -> recover them, flush pending, no duplicates.
  - Accepted send with lost response, retry -> one copy.
  - Failed sends shown clearly, text preserved. Retry for recoverable; explain non-recoverable.
- Mock service assigns final order. Queued outgoing keep local order until confirmed.
  Repeated responses must not add copies or make thread jump.
- Focused test: recovery after app restart.

## 2. Payments / paid access (25%)
- Paywall with mock purchase service. Purchase result separate from backend confirmation. Label "simulated billing".
- Show product, price, purchase state. Prevent duplicate purchase flows from repeated taps.
- Demo: purchase, cancel, failure, restore.
- Purchase success + backend confirmation pending -> honest state. Grant access only when backend confirms.
- Repeated events -> no duplicate effects. Unrelated purchase failure must not revoke valid access.
- Test: delayed confirmation.
- README: how to connect to store billing, backend validation, expiry/refunds.

## 3. Pleasant + measured (30%)
- 50,000 short messages generated repeatably in mock; pagination + virtualized list.
- Scroll + typing responsive. Failure states designed with care. Animations, respect reduced motion.
- Profile repeatable scroll-and-type sequence: build mode, frame timing / dropped frames, memory.
  One bottleneck, before/after measurement, same history and sequence. Say when tools can't measure.

## Submission (15% debugging evidence/tests/explanation)
- Firstname_Lastname.zip -> join@fansapi.com. Source, lockfile, setup, focused tests.
- Recording of scenarios (uncut recovery sequences).
- README: duplicate bug, decisions, test results, perf numbers, platform limitations, time spent.
- AI.md: tools used, output checked/corrected, uncertainties.
- Few sentences: resuming large media upload after network drop / restart (background vs force-quit).
- App Store + Google Play rules for creator content and payments, official links, impact on scope.

## Walkthrough
30 min: reproduce a failure, explain fix, what to check first for real users. Payments/paywalls shipped.
