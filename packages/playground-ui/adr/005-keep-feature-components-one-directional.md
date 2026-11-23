---
status: proposed
date: 2026-10-13
decision-makers: Codegena project maintainers
---

# Keep feature component dependencies one-directional

## Why

Early Playground extractions shortened parent files but left children importing parent styles, sibling types, or shared CSS fragments. Those hidden upward dependencies made a component's directory misleading and reuse difficult.

## Decision

> [!IMPORTANT]
> **A feature owns its state and passes prepared props downward. Children MUST NOT import parent-private files; reusable UI lives at a neutral level.**

- **🧭 Feature owner:** `Playground` owns cross-region layout and navigation. Its source, generated-output, and details children receive data and callbacks through props.
- **📁 Directory boundary:** Each feature **MUST** keep markup, props, styles, hooks, and stories together. Its `index.ts` **MUST** export only intended public entities. A child **MUST NOT** import private parent or sibling styles, types, or behavior.
- **🧩 Shared UI:** Generic controls such as `PanelHeader` belong in [`ui-unified`](../../ui-unified/README.md). Warning cards and lists keep their diagnostic semantics in [Playground UI](../misc-ui/warning-detailed/). A repeated coherent UI composition becomes a component, not merely a shared CSS function.
- **🪝 Derived behavior:** Significant data transformations or imperative UI behavior belong in focused hooks. Mapped rows with distinct markup own their JSX and styles. Use object-form `clsx` for component-owned modifier classes; give changing accessibility labels a named, memoized owner.
- **🔌 Notification composition:** The host supplies an optional `notificationProvider`; Playground **MUST** mount it inside the active MUI theme so portaled cards match Light/Dark mode. The host owns the transport implementation.

This is an ownership rule, not a mandate to extract every JSX fragment or export internal helpers. The [React code style rules](../../../CODE_STYLE.md#react-rules) contain the detailed file and prop conventions.

## Trade-offs

- **✅ Good:** Imports and directory entrypoints reveal ownership; shared controls have no Playground-private dependency.
- **⚠️ Cost:** More small files and explicit props; judging genuine reuse still requires review.

## Alternatives

- **Keep giant parents:** Fewer files, but mixed responsibilities.
- **Extract JSX yet import parent styles:** Shorter parent, same hidden coupling.

## Where to look

[`Playground`](../playground/playground.tsx) composes regions; [generated output](../playground/generated-output/), [file details](../generated-file-details/), [tree](../generated-files-list/), and [warnings](../misc-ui/warning-detailed/) have separate ownership. The [details entrypoint](../generated-file-details/index.ts) shows the export boundary.

## Verification

- [ ] No child imports parent-private files; feature directories expose only intended entrypoints.
- [ ] Shared headers/warnings use neutral components; presentation does not require a concrete service.
- [ ] The optional notification provider follows the active theme; related Playground Nx checks pass.
