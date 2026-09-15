# Design analysis from mockups (measured, 375pt @1x mobile frames)

Source files: /Users/sledyuk/Documents/fansapi/Messages {Fan,Creator}/{Mobile,Desktop}/*.png
We build the **Fan** side of the chat (fan talks to creator, fan pays). Creator mockups used only for
patterns (emoji bar, fan details sheet) — out of scope.

## Palette (sampled; all values are Tailwind zinc/neutral/green/blue scale + brand)
| Token | Hex | Tailwind | Used for |
|---|---|---|---|
| brand.primary | #5863DE | custom | send button, links, @handles, badge text, selected borders, tab tint |
| brand.primaryPressed | #545ED1 | | send button pressed / gradient bottom |
| brand.primarySoft | #EAEBFB | | badge bg, selected list row bg |
| brand.primaryTint | #F6F7FD | | outgoing bubble bg, media bubble bg, gift bubble bg |
| brand.primaryTint2 | #F7F7FD | | selected payment card bg |
| accent.gift | #8258DE | | gift icon glyph + border, gift composer button border |
| text.primary | #18181B | zinc-900 | message body, list name |
| text.heading | #0A0A0A | neutral-950 | screen title, totals |
| text.secondary | #3F3F46 | zinc-700 | header name, icons |
| text.muted | #71717A | zinc-500 | timestamps, previews, counter |
| text.placeholder | #737373 | neutral-500 | input placeholders, legal links |
| text.section | #52525B | zinc-600 | "Today" divider label |
| bg.screen | #FFFFFF | | |
| bg.incoming | #F4F4F5 | zinc-100 | incoming bubble |
| bg.subtle | #F5F5F5 | neutral-100 | attachment chip, gift button bg, emoji bar |
| bg.panel | #FAFAFA | neutral-50 | popup panels |
| border.default | #E5E5E5 | neutral-200 | inputs, cards, composer |
| border.divider | #E4E4E7 | zinc-200 | header bottom line, tab bar top line |
| status.online | #16A34A | green-600 | online dots |
| status.error | #DE3333 | | attachment remove x. Use for failed sends too. |
| status.verified | #2563EB | blue-600 | verified badge |
| pending (ours) | text.muted + clock glyph | | designed state |
| offline banner (ours) | bg #FEF3C7 / text #92400E (amber) | | designed state |

## Typography (font not embeddable from PNG — looks like Inter/Geist; use Inter via @expo-google-fonts/inter, fallback system)
| Role | Size/weight (measured cap heights) |
|---|---|
| Screen title "Chat with" | 16 / 600 |
| Header name | 15 / 600, handle 13 / 400 primary |
| Badge "Fan in All Access" | 14 / 500 |
| Message body | 15 / 400, line-height 20 |
| Timestamp | 12 / 400 muted |
| "Today" | 13 / 400 |
| Composer text | 15 / 400 |
| Counter "0/400" | 12 / 400 |

## Geometry (pt)
- Screen horizontal padding: 16.
- Header: back arrow at x16, title at x48, kebab right x341. Row 2: avatar 32x32 at (16,107), name/handle, badge pill right-aligned: h28, r8, bg primarySoft, star icon + text, right edge 355 (20 from screen edge).
- Header bottom divider: 1pt #E4E4E7 at y154 (whole header ≈ 100pt below status bar).
- "Today" centered, 40pt gap from divider.
- Incoming bubble: x61→357 (left 61 = 16 + 32 avatar + 13 gap; right margin 18), padding 16 h / 12 v, radius 16, bg zinc-100. Avatar 32x32 bottom-aligned with bubble, x16.
- Outgoing bubble: x42→355, same padding/radius, bg primaryTint, no avatar. Max width ≈ 84% of screen.
- Media bubble: outer x39→358 padding 12, image 296x380 r12, caption below 12pt, timestamp under.
- Gift bubble: 48x48 icon box (r8, bg #F5F5F5, border 1 #8258DE) + text, bg primaryTint.
- Timestamp inside bubble bottom-left, 8pt below text.
- Bubble vertical gap: 24.
- Composer area: top y1100 (list ends ~1064), input box y1111→1164 (h54), x16→262, r10, border 1 #E5E5E5. Left "+" attach icon 20x20 at x33. Attachment chip inside input (bg #F5F5F5 r6, thumbnail 16, name, red x).
- Gift button 44x44 r10 bg #F5F5F5 border 1 #8258DE at x270. Send button 44x44 r10 bg primary at x319, white paper-plane icon.
- Below composer: left "0/400" muted 12; right "Available messages: Unlimited" (last word primary).
- Creator variant adds emoji quick-bar (h36, r10, bg #F5F5F5) above input — not needed for fan side.
- Message list rows: h60, avatar 40 r20 with 12pt presence dot bottom-right, name 15/600 + @handle primary, preview 13 muted, time 12 muted; selected row bg primarySoft r10 inset 16. Search input h38 r10 border #E5E5E5.
- Tab bar: 5 icons, bg white, top border #E4E4E7, icon color zinc-700, active primary.
- Popups (desktop): cards r10 border #E5E5E5, selected card border primary bg #F7F7FD, primary CTA h40 r8 bg primary white text, amount chips r6 border #E5E5E5.

## Icons
Outline set (Lucide-style): arrow-left, more-vertical, star (filled in badge), gift, send (paper-plane), plus-circle, search, sliders. Use lucide-react-native (SVG).

## Designed-by-us states (must stay consistent with above)
- Pending: outgoing bubble at 70% opacity + 12pt clock glyph + "Sending…" in timestamp slot (muted).
- Failed: bubble border 1 status.error, timestamp slot shows "Not sent · Retry" (Retry in primary) or explanation "Subscribe to send" for non-recoverable, tapping opens paywall.
- Offline banner: full-width strip under header, amber bg, "You're offline — messages will send when you reconnect", slides in/out (respects reduced motion).
- Reconnecting/syncing: same strip, primarySoft bg, primary text with small spinner.
- Paywall sheet: bottom sheet r16, product card style of gift popup (selected card), price row, primary CTA "Subscribe · $9.99/mo", secondary "Restore purchase", footer "Simulated billing" tag, states: idle / purchasing (spinner in CTA, disabled) / awaiting confirmation (amber pill "Confirming with server…") / active (green pill) / failed (error text + retry) / cancelled (toast).
- Locked gate: when fan not subscribed, composer replaced by primarySoft card "Subscribe to message Ethan" with CTA.
