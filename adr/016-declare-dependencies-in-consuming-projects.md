---
status: proposed
date: 2026-11-15
decision-makers: Codegena project maintainers
---

# Declare dependencies in consuming projects

## Why

Root-only declarations hide which application or library needs a package.
Hoisting can make a missing declaration work locally, while a published library
or an independently installed application cannot resolve it. Putting runtime
controls in `devDependencies` also gives consumers an incomplete contract.

## Decision

> [!IMPORTANT]
> **Every Nx project MUST declare its consumed packages in its own manifest.
> Root declarations provide shared versions and workspace tools; they do not
> replace project declarations.**

- **📦 Applications and private libraries:** Runtime packages shared by two
  or more projects **MUST** be `peerDependencies`, including workspace
  libraries. The root provider does not count as a consuming project.
  Single-project runtime packages belong in `dependencies` unless another
  peer requirement applies.
- **🧩 Publishable libraries:** Shared runtime packages **SHOULD** be peers.
  A library **MAY** keep them in `dependencies` to simplify installation of its
  distributed package. This choice does not move development tools into peers.
- **🎛️ Unified toolkit:** Runtime packages from
  [the unified list](../.unified-ui-packages.json) **MUST** be major-only
  peers in every consuming project, following the
  [UI toolkit decision](005-standardize-react-ui-toolkit.md). Required styling
  and declaration peers remain explicit even without direct imports.
- **🎨 Runtime UI:** UI packages such as `@mui/material` and
  `@mui/x-tree-view` **MUST NOT** be `devDependencies`. Consuming projects
  describe the supported peer versions; the root provides concrete versions.
- **🔌 Other peers:** Runtime use of `ansi-colors`, `ansi-to-react`, and
  `jsonc-parser` **MUST** be declared as major-only peers too. These packages
  remain outside the unified UI list. npm can resolve a single-consumer peer
  without adding an otherwise unused direct root dependency.
- **🧪 Development:** Test runners, Storybook, compilers used only for builds,
  and local configuration tools belong in `devDependencies`. E2E projects
  **MUST** have their own manifests too. A compiler used by the generator at
  runtime remains a runtime dependency or peer.
- **🔧 Published configuration:** Dependencies loaded by `@codegena/infr-nx`'s
  exported lint and build helpers are runtime dependencies of that package.
  Its consumers use it as a development dependency.
- **🏠 Root:** Shared runtime packages and the unified list **MUST** be in
  root `dependencies`; shared development tools belong in root
  `devDependencies`. The root **MUST NOT** have `peerDependencies`.
  Single-project runtime packages **MUST** stay in the consuming project unless
  they are in the unified list. Genuine development tools **MAY** remain at
  root even with one consumer. Project declarations still apply.
- **🔗 Installation:** Workspace dependencies **MUST** use npm workspace
  linking. Manifest changes **MUST** update the root lockfile using the npm
  version declared in the root manifest. Peer validation stays enabled.

## Example

A UI library and its application both declare `@mui/material: "5.x"` as a peer.
The root declares `@mui/material: "^5.18.0"` in `dependencies` because MUI belongs
to the unified toolkit. None of these
declarations is a development dependency.

The landing's `shaders` package belongs in the landing application's
dependencies. It needs no root declaration when no other project uses it.
`lenis`, Motion, Three.js, and Embla belong to the unified toolkit, so their
runtime declarations are peers with root providers.

## Consequences

- **✅ Visible ownership:** A manifest states what its project needs at runtime
  and during development. npm may still hoist packages into root `node_modules`.
- **⚠️ Repetition:** Consuming projects repeat required shared peers. Shared versions
  and the lockfile must be updated together.
- **🔒 Security updates:** Fix vulnerable dependency chains with compatible
  releases first. Any necessary override must target a verified compatible
  dependency and remain visible in the manifest.

## Security updates and overrides

Security remediation follows the same ownership as other dependency changes:

- **📦 Direct packages:** Update their consuming manifests and any shared root
  provider, then update the lockfile. An override should not replace that work.
- **🔧 Transitive packages:** A root override may select a compatible patched
  release when its parent does not yet select it. Limit the override to the
  affected dependency branch and verify the APIs used by its callers.
- **🧹 Remove obsolete overrides:** Review an override when its parent adopts
  the fix or the dependency is removed. Keep exact versions and selectors in
  the manifest and lockfile, rather than maintaining another list in this ADR.

The [dependency-audit decision](017-check-dependencies-with-audit-ci.md) defines
the audit, approval requirements for Nx or breaking updates, and temporary
exceptions when no patched release exists. Advisory-specific reasons and
deadlines belong in
[`.vulnerabilities-ignore.json`](../.vulnerabilities-ignore.json).

## Verification

- Every Nx project has a manifest; direct imports and configured tools resolve
  from declared packages.
- Runtime UI packages are absent from development dependencies. Published
  libraries and applications retain required peers, supplied by the root.
- A locked install, npm audit, and affected Nx checks verify the change.
  Browser image baselines are not replaced as part of dependency maintenance.
