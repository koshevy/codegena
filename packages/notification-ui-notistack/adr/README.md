# Notistack notification UI decisions

Uppercase requirement terms in these records use the [repository ADR index's RFC 2119 convention](../../../adr/README.md#requirement-language). Rationale and trade-offs are descriptive.

These records explain how `@codegena/notification-ui-notistack` implements the transport contract. Their `proposed` status means they are documented for maintainer review, while the described behavior is implemented.

## How the decisions are grouped

- **Local delivery:** adapt the shared transport contract to Notistack without exposing Notistack to consumers.
- **Presentation and overflow:** use themed cards for visible messages and a bounded, expandable group for excess messages.

The [Notification UI Core ADR](../../notification-ui-core/adr/README.md) owns the transport contract. The [repository package-boundary ADR](../../../adr/002-keep-package-dependencies-one-directional.md) owns the direction of this dependency.

## Reading order

1. [Adapt local notifications to Notistack](001-adapt-local-notifications-to-notistack.md) — provider composition, lifecycle mapping, stack limit, and overflow group.

## What the tests established

- Visible messages use the `ui` channel and report showing and closing callbacks.
- Excess messages remain addressable by ID in an expandable group instead of being discarded.
- Actions can close one message, while group dismissal closes the grouped messages.
