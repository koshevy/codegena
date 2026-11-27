---
status: proposed
date: 2026-11-01
decision-makers: Codegena project maintainers
---

# Keep the UI kit below feature libraries

## Why

A shared icon or editor can serve Graph UI and Playground UI. If it imports a
notification service or one of those views, it becomes tied to a feature and
cannot remain a stable foundation for both.

## Decision

> [!IMPORTANT]
> **`@codegena/ui-unified` MUST NOT have a runtime dependency on another
> Codegena UI library. Features compose shared controls with their own services.**

- **🧱 Base layer:** Shared controls receive icons, text, state, and callbacks
  through props. They **MUST NOT** import Graph UI, Playground UI, or a
  notification transport.
- **🎨 Theme:** MUI and the Codegena theme supply visual tokens. `ui-theme`
  **MAY** be a development dependency for stories; controls read the active
  MUI theme rather than importing a feature's theme instance.
- **📋 Feature actions:** Clipboard feedback, graph selection, and warning
  formatting belong with their feature owner. Playground's clipboard hook, for
  example, composes the browser clipboard with its notification facade above
  the UI kit.
- **🔣 Declaration icons:** The shared icon button accepts a local visual-kind
  union. It **MUST NOT** import schema or graph node types; those packages map
  their values to the icon's props at the call site.

## Trade-offs

- **✅ Good:** The UI kit stays usable in a smaller host that has no graph or
  notification engine.
- **⚠️ Cost:** Features write small adapters for service-aware actions instead
  of hiding those actions inside the shared controls.

## Where to look

The [declaration icon](../icons/declaration-type-icon/) accepts a visual kind.
Playground's [clipboard hook](../../playground-ui/clipboard/) owns
notification feedback.

## Verification

- [ ] The UI kit manifest contains no runtime dependency on another Codegena
  UI library.
- [ ] Its production imports contain no Graph UI, Playground UI, or
  notification transport import.
- [ ] Build, Storybook, and UI kit E2E checks pass.
