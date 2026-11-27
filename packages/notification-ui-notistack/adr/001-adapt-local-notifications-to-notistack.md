---
status: proposed
date: 2026-10-16
decision-makers: Codegena project maintainers
---

# Adapt local notifications to Notistack

## Why

The shared `ui` transport has no toast presentation or stacking policy. Local messages must match Codegena's theme and remain inspectable during a burst without making Notistack part of the core contract.

## Decision

> [!IMPORTANT]
> **The Notistack adapter owns local delivery, bounded stacking, and themed presentation; consumers continue using the core facade.**

- **🔌 Provider and transport:** [`NotistackNotificationProvider`](../src/lib/notistack-notification-provider.tsx) mounts Notistack and the core provider. [`NotistackNotificationTransport`](../src/lib/notistack-notification-transport.tsx) implements the `ui` channel through `useSnackbar()`.
- **🎨 Visible card:** [`NotificationCard`](../src/lib/notification-card/notification-card.tsx) uses a themed paper surface and severity border, inspired by Playground's [`WarningDetailed`](../../playground-ui/misc-ui/warning-detailed/warning-detailed.tsx).
  - A titleless message has no empty heading row; actions and dismissal remain available.
- **📚 Bounded overflow:** `maxVisible` defaults to 4 and **MUST NOT** fall below 2.
  - One slot holds an expandable summary; excess messages remain addressable by ID instead of disappearing.
  - [`NotificationGroupCardContainer`](../src/lib/notification-group-card/notification-group-card-container.tsx) handles transport subscriptions and actions; [`NotificationGroupCard`](../src/lib/notification-group-card/notification-group-card.tsx) receives view-ready props and owns only display behavior.
- **⏱️ Lifecycle:** Notistack events map to showing and closing callbacks. Reasons remain distinct: `timeout`, `dismiss`, and `revoke`; every message has a stable ID.
- **📐 Consistent surface:** Cards and expanded groups share width, nested cards fit without horizontal scrolling, and the group uses a themed auto-hiding OverlayScrollbars viewport.
  - The adapter depends on `notification-ui-core` and `ui-theme`; React, Notistack, OverlayScrollbars, MUI, and icons are peers.
- **🧬 Duplicate identity:** Active messages with the same `title` and `fallbackMessage` **MUST** reuse one ID across visible and grouped entries.
  - Body, actions, severity, and other presentation fields **MUST NOT** affect comparison.
  - Duplicates receive the active message's lifecycle callbacks; after it closes, the same text can be shown again.
  - Deduplication belongs here because [Notistack's option](https://notistack.com/features/basic#prevent-duplicate) compares a different message/key surface.

The group is not persistent history: grouped messages stay grouped until dismissed or revoked, even when a visible slot opens. Remote and agent delivery, cross-tab synchronization, and a global store are outside this adapter.

## Trade-offs

- **✅ Good:** One provider gives consumers themed notifications and makes bursts inspectable.
- **⚠️ Cost:** Overflow and lifecycle mapping add local queue state; grouped messages do not automatically promote into cards.

## Alternatives

- **Only Notistack `maxSnack`:** Bounds the screen but gives no inspection surface for excess messages.
- **Notistack APIs in core:** Couples every channel to one UI engine.

## Verification

- [x] [Transport](../src/lib/notistack-notification-transport.spec.ts), [provider](../src/lib/notistack-notification-provider.spec.tsx), and [group-card](../src/lib/notification-group-card/notification-group-card.spec.tsx) tests cover delivery, duplicates, overflow, callbacks, and view/service separation.
- [x] [Integrated](../src/story-utils/notification-story.stories.tsx) and [group-card](../src/lib/notification-group-card/notification-group-card.stories.tsx) stories cover burst, light/dark, and overflow states.
- [x] Browser review confirmed 400px card width at a 1280px viewport and vertical overflow without horizontal scrolling; package Nx build, lint, test, Storybook, and type checks pass.
