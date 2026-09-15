# iOS 26 design decisions (source: https://designfornative.com/ui-changes-in-ios-26-thats-not-about-liquid-glass/)

| iOS 26 change | What we do |
|---|---|
| Toolbars use icon-only, contained buttons; left-aligned titles + subtitles | `ModalLayout`: left title + subtitle, round filled close button, optional contained action. Chat header keeps the mockup's back arrow + kebab. |
| Buttons are "contained" with space around them | `IconButton filled` (Chats "+", filter) and round close. |
| Tab bar floats, search may sit at the bottom | Native tabs already float. Chats search is contextual → stays at the top. |
| Fullscreen modals cover the screen; stack only when a modal opens over a modal | Accepted. Fan details is a single `presentation: 'modal'` sheet. Black window backdrop is a dev-build nicety only. |
| Action sheets appear where you interact | When we add message actions, anchor them to the bubble (context menu), not a bottom sheet. |
| Larger, concentric rounded corners; more spacing | `radii.card = 14` for cards inside sheets (sheet ≈ 30 − 16 padding), body gap 16. |
| Left-aligned, sentence-case titles; bigger list titles | "Fan details", "User bio", "Notes". Title 20pt in modals. |
| Scroll-edge blur under floating chrome | `ModalLayout` fades content under the header with a short gradient (Expo Go has no native scroll-edge effect API). |
