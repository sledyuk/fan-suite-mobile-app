# AI use

## Tools

- **Claude Code** (Anthropic, Claude Fable 5.1 and earlier Claude models during the task) for implementation, tests, debugging and documentation.
- **OpenAI Codex** for a second, independent code review of the message-safety and payment flows.
- **Expo SDK 57 documentation** was read directly for every native module used; `AGENTS.md` pins the agents to the versioned docs.

## Examples of output that was checked or corrected

- **Sync trigger after injecting incoming messages.** The generated debug action wrote four messages to the mock server but nothing pulled them, so they only appeared after reopening the chat. Traced to the sync worker only reacting to the online flag; fixed by syncing right after the inject.
- **Outbox persistence order.** The first version persisted through a MobX reaction. A review check with a throwing storage showed `enqueue` still succeeded and the composer cleared the text. Corrected to a synchronous write with rollback and an error in the composer.
- **Idempotency mapping in two writes.** The generated server persisted the accepted message, then the `clientId` mapping in a second write. A simulated failure between the writes plus a retry after restart produced a duplicate. Corrected to a single commit.
- **Backoff test that could not fail.** The original backoff test only asserted the final attempt count, so it passed even though all retries fired at time zero. Replaced with a fake-clock test that asserts the count one millisecond before and after each deadline.
- **Full-history serialization on every send.** Generated code persisted the whole thread including the 50,000-message seed. Restructured storage to keep only the accepted tail and regenerate the deterministic seed.
- **Paywall dead end.** The bubble always routed a payment-required failure to the paywall, even after access was confirmed. Added a store reaction that requeues those items and changed the tap and hint accordingly.
- **Broadcast that did not send.** The generated broadcast screen appended to local state only. Rewired to enqueue one outbox item per recipient.
- **UI details** such as the About sheet alignment, debug console content, and the wallet payout stub were reviewed against screenshots and adjusted or explained rather than accepted as generated.

## What I remain unsure about

- **Device performance.** No repeatable frame-time or memory profile has been captured on a physical phone. The change in finding 6 removes the largest synchronous write from the send path, but its effect on frame timing has not been measured before and after.
- **Android.** The app was opened on Android briefly. Keyboard, safe-area and glass-effect behaviour there has not been verified.
- **Storage engine.** `expo-sqlite` key-value storage is used as the durable store. Its write is synchronous from JavaScript, which the persistence guarantees depend on; I have not verified fsync behaviour under a hard power loss.
- **MobX strict-mode warnings** in tests are silenced by `enforceActions: 'never'`. This is deliberate for the prototype but hides accidental out-of-action mutations.
