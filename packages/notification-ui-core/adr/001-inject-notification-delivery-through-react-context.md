---
status: proposed
date: 2026-10-15
decision-makers: Codegena project maintainers
---

# Inject notification delivery through React context

## Why

Shared React components need to request notifications without importing a particular toast, agent, or backend engine. An application may replace delivery channels while those components remain mounted.

## Decision

> [!IMPORTANT]
> **`notification-ui-core` defines the transport contract; applications supply transports through React context.**

- **🔌 Contract:** [`NotificationTransport`](../src/lib/notification-transport.ts) identifies its `ui`, `agent`, or `backend` channel, delivers a [`NotificationMessage`](../src/lib/notification-message.ts), and supports closing or revoking it.
  - Messages have a plain fallback string; rich content and actions are optional.
- **🧩 Provider:** [`NotificationProvider`](../src/lib/notification-provider.tsx) supplies a transport list. The nearest provider **MUST** win; replacing its list **MUST** update delivery for mounted consumers.
- **📣 Facade:** [`useNotification`](../src/lib/use-notification.ts) returns [`NotificationTransportFacade`](../src/lib/notification-transport-facade.ts). It can notify all or selected channels, returns IDs by channel, and supports close/revoke. Outside a provider, the hook fails clearly.
- **🪶 Optional delivery:** [`useOptionalNotification`](../src/lib/use-optional-notification.ts) returns the same facade when a provider exists and `null` otherwise. A copy action can still work without a notification transport; it simply has no delivery channel for feedback.
- **🎨 Presentation stays outside:** Engine adapters **MUST** own queueing, stacking, dismissal UI, and visual policy. This package **MUST NOT** define a global notification queue.

## Trade-offs

- **✅ Good:** Consumers have one React API while applications can change engines.
- **⚠️ Cost:** Feedback requires a provider, and each adapter implements delivery and lifecycle behavior. Optional consumers must handle `null` explicitly.

## Alternatives

- **Import a toast engine in shared components:** Makes that engine a dependency of every consumer.
- **Process-wide singleton:** Obscures nested React ownership and runtime replacement.

## Verification

- [x] [Provider tests](../src/lib/notification-provider.spec.tsx) cover routing, replacement, missing-provider failure, and optional access.
- [x] The [Storybook example](../src/lib/notification-provider.stories.tsx) demonstrates replacement; package Nx build, lint, test, and Storybook checks pass.

The [Notistack adapter](../../notification-ui-notistack/adr/README.md) shows one implementation; the [package-boundary decision](../../../adr/002-keep-package-dependencies-one-directional.md) keeps it downstream.
