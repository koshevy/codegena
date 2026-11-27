---
status: proposed
date: 2026-11-14
decision-makers: Codegena project maintainers
---

# Share appearance with the embedding application

## Why

A converting placeholder and the Playground it replaces can disagree when each
restores its own appearance. An embedded Playground can also change its theme
without changing the surrounding application.

## Decision

- **🎨 One owner:** A host that controls appearance **MUST** mount
  `PlaygroundAppearanceProvider` from `@codegena/playground-ui/appearance`
  around both its loading views and Playground. It supplies `mode` and
  `onModeChange`; the provider resolves System through the device preference.
- **🔁 Shared updates:** Playground **MUST** use that provider's mode and report
  appearance edits to its callback. It **MUST NOT** restore another theme or
  mount a second MUI theme provider inside this boundary.
- **🧩 Independent use:** Without this provider, Playground **MUST** retain its
  existing saved appearance and `defaultThemeMode` behavior.
- **☰ Host navigation:** `onSandwichButtonClick` **MAY** expose a host-owned menu.
  Playground renders the named button after GitHub only when this callback is
  supplied. The host owns the menu's contents, lifetime, and actions.
- **📦 Lazy loading:** The appearance entrypoint **MUST NOT** load graph views
  or Monaco. Applications can apply the correct theme before loading them.

## Application composition

The Playground remote owns a standalone saved choice. When embedded, its App
receives the host's `appearance` and navigation callback explicitly. Its router
fallback and converted view remain inside the same appearance provider. The
landing retains ownership of its theme and receives edits through this contract.

## Verification

Desktop and mobile browser cases check the conversion placeholder, completed
Playground, example switching, appearance edits, and returning to the host.
The ordinary Playground theme journeys continue checking independent use.
