# Notification UI Core architecture decisions

Uppercase requirement terms in these records use the [repository ADR index's RFC 2119 convention](../../../adr/README.md#requirement-language). Rationale and trade-offs are descriptive.

These records explain the public contract of `@codegena/notification-ui-core`. Their `proposed` status means they are documented for maintainer review; the described behavior is implemented.

## How the decisions are grouped

- **Delivery boundary:** React components use one facade over replaceable UI, agent, and backend transports while applications choose their engines.

The repository-level [package dependency ADR](../../../adr/002-keep-package-dependencies-one-directional.md) explains why an engine-specific UI library should depend on this contract, rather than the reverse.

## Reading order

1. [Inject notification delivery through React context](001-inject-notification-delivery-through-react-context.md) — the transport contract, provider, and consuming hook.

## What the tests established

- A consumer dispatches through the selected transport type without knowing its engine.
- Replacing a provider's transport list changes subsequent delivery for an already mounted consumer.
- The facade returns IDs by transport type; a missing provider fails with a clear error.
