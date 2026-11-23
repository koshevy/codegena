<a id="codegena-code-style"></a>

# Codegena code style

**Make ownership, data flow, and intent visible.** This guide defines Codegena's
conventions for file layout, package boundaries, security, TypeScript, React,
accessibility, testing, and refactoring. It complements automated checks and
architecture decisions.

**Terms:**

- **Owner:** The feature or project responsible for a behavior.
- **Nx project:** A library or application in this workspace.
- **Entrypoint:** A supported public import path.
- **ADR:** An architecture decision recorded in the repository's
  [ADR index](adr/README.md).

**Requirement levels:** Capitalized terms follow [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119):

- **MUST / MUST NOT:** Repository requirements.
- **SHOULD / SHOULD NOT:** Preferred approaches; a justified exception is possible.
- **MAY:** A permitted choice.

Explanatory prose and examples do not add requirements.

**Examples:**

- **❌ Bad** is a pattern to avoid;
- **👌 Acceptable** appears only for a distinct valid case;
- **✅ Good** is preferred for the case at hand. The fragments illustrate
  style rather than form standalone programs.

**👤🤖 Audience:**

This guide directly instructs human contributors and AI
assistants working in this repository. Unmarked rules apply to both;
**[🤖 AI only]** marks requirements specific to AI assistants.

---

<a id="contents"></a>

## Contents

- [🧱 Underlying concepts](#underlying-concepts)
- [📁 File structure](#file-structure)
- [📦 Packages and package dependencies](#packages-and-package-dependencies)
- [🛡️ Security](#security)
- [🛠 Project configuration](#project-configuration)
- [🔎 TypeScript rules](#typescript-rules)
- [🧩 React rules](#react-rules)
- [♿ Accessibility](#accessibility)
- [🧪 Testing](#testing)
- [🔧 Design and refactoring](#refactoring)
- [✅ Verification and sources](#verification-and-sources)

---

<a id="underlying-concepts"></a>

## 🧱 Underlying concepts

Codegena is a **monorepo of focused projects**. Its work includes:

- **⚙️ Generation:** Libraries and command-line tools that turn schemas into
  code.
- **🧭 Exploration:** Tools for inspecting generated results and relationships.
- **🎨 Interfaces:** Interactive views for working with those results.
- **🧪 Verification:** Tests and end-to-end (E2E) projects that check behavior
  across the workspace.

**Start here:** Follow the [README quick start](README.md#get-started). For a
change, find its owner by responsibility and use the project graph to see what
else it affects. The numbered sections below contain the coding rules.

<a id="concept-nx"></a>

### 🧭 Monorepo and Nx

We use [NX](https://nx.dev/) as the main tool for managing this monorepo.
A **monorepo** places projects with different jobs side by side,
with shared tools and visible relationships.

- **📦 Projects:** The parser, generator, React UI, applications, and E2E
  suites keep distinct responsibilities while sharing lint, test, and build
  tooling.
- **🕸️ [Project graph](https://nx.dev/docs/features/explore-graph):** Shows
  dependencies. `oas3-visitor-typescript` uses `oas3-core`, so a parser change can affect generated
  TypeScript.
- **🎯 [Affected tasks](https://nx.dev/docs/features/ci-features/affected):**
  Select relevant checks from changed files and task inputs. CI can skip
  unaffected builds, tests, and E2E suites; Nx can reuse cached results.

> **New to Nx?** Start with its [official introduction](https://nx.dev/docs/getting-started/intro).

**Try it locally:**

```bash
# List the projects in this workspace.
npm exec -- nx show projects

# Open their interactive dependency graph.
npm exec -- nx graph
```

<a id="concept-mui"></a>

### 🎨 React, MUI, and the shared theme

**[React](https://react.dev/learn)** builds the interactive views from
components.
[Material UI (MUI)](https://mui.com/material-ui/getting-started/) supplies
ready-made React controls and a theme system; Codegena uses its own colors and
typography through [`ui-theme`](packages/ui-theme/).

**In this repository:**

- **Shared themes:** The [light](packages/ui-theme/src/lib/theme/codegena-light-theme.tsx)
  and [dark](packages/ui-theme/src/lib/theme/codegena-dark-theme.tsx) themes
  use separate palettes and share [typography](packages/ui-theme/src/lib/theme/typography.ts)
  and [MUI options](packages/ui-theme/src/lib/theme/theme-options.ts).
- **Theme-aware control:** The [file-tree style](packages/playground-ui/generated-files-list/items/generated-files-list-tree-item.styles.tsx)
  wraps MUI X's `TreeItem`. Its selection color comes from
  `alpha(theme.palette.primary.main, 0.13)`, so it follows the active theme.
- **Further reading:** [UI toolkit decision](adr/005-standardize-react-ui-toolkit.md),
  [styling rules](#rule-53), and [accessible controls](#rule-54).

<a id="concept-typescript"></a>

### 🔒 Strict TypeScript

**[TypeScript](https://www.typescriptlang.org/docs/handbook/2/basic-types)
is the foundation of safe, predictable development here.** Strict
compile-time contracts let the checker expose mistakes while we design and
change code.

- **🔒 Strict by default:** The [root configuration](tsconfig.base.json)
  enables `strict`, `noImplicitAny`, and other checks. Keep those checks in
  place so missing or uncertain values remain visible.
- **🔎 Prove before use:** [Narrow values](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
  with conditions and reusable type guards. For example,
  [`isSchemaString`](packages/oas3-core/json-schema/json-schema-type-guards.ts)
  refines an unknown schema before its fields are read. This preserves useful
  types throughout the code instead of discarding them with casts.
- **🛡️ Protect the boundary:** Every `any` opts out of checking at that point;
  it is a hole in type safety and can hide security-relevant mistakes around
  external input. Static types cannot validate incoming JSON, so runtime
  guards still matter.
- **🧹 Enforce the standard:** The [shared ESLint setup](packages/infr-nx/eslint-config/)
  combines strict, type-aware `typescript-eslint` rules with
  `eslint-plugin-react`, `eslint-plugin-react-hooks`, and
  `@stylistic/eslint-plugin`. Aim to satisfy the rules; exceptional
  suppressions require [explicit approval](#rule-74).

See [TypeScript source sets](#rule-16), [unknown-value narrowing](#rule-26),
and [lint verification](#rule-72).

<a id="concept-test-first"></a>

### 🧪 Grow features through tests

Codegena develops features **test-first**: describe the behavior in a failing
test, implement it, then keep the test as regression coverage. The
[testing pyramid](https://martinfowler.com/bliki/TestPyramid.html) keeps most
checks fast and close to their owner, with fewer browser journeys above them.

- **🔬 [Jest](https://jestjs.io/docs/getting-started):** Cover small features and
  edge cases in focused specs beside the owning code.
- **🌐 [Playwright](https://playwright.dev/docs/intro):** Cover new UI behavior
  and reproduce every UI bug before fixing it. Keep those journeys in the
  related E2E project, such as [Playground UI E2E](apps/playground-ui-e2e/).
- **🔗 Across layers:** A core feature also needs a representation in its
  related UI and a Playwright path through it. Lower-level tests prove its
  details; E2E proves the user can reach it.

See the [testing rules](#testing) and [test-first decision](adr/011-develop-features-test-first-across-the-testing-pyramid.md).

<a id="concept-adr"></a>

### 📝 Architecture decision records

An [architecture decision record (ADR)](https://adr.github.io/) explains
**why** a significant design choice was made and its trade-offs.

- **Across projects:** Start at the [repository ADR index](adr/README.md).
  For example, the [transitive-node decision](adr/001-use-transitive-nodes-as-schema-boundary.md)
  explains the parser-to-generator boundary.
- **Within a project:** Read its local records. For example,
  [OAS3 Core's convertor decision](packages/oas3-core/adr/004-process-schemas-through-ordered-recursive-convertors.md)
  explains how schemas are processed.
- **Status:** `proposed` records describe current behavior awaiting maintainer
  review. Read the relevant decision before changing its contract; see
  [when to record a new decision](#rule-71).

<a id="concept-shared-guidance"></a>

### 🤝 One standard for people and AI

AI assistance is part of development here. Human contributors and AI
assistants use the same guidance:

- **Shared sources:** This guide defines code conventions; the
  [ADRs](adr/README.md) explain architectural decisions. Guides and ADRs use
  explicit context and unambiguous wording so people and AI can understand
  them without private chat history.
- **Agent workflow:** [AGENTS.md](AGENTS.md) and
  [skills](.agents/skills/) explain how assistants apply that guidance. They
  refer back to the shared documents instead of maintaining competing rules.
- **Same quality bar:** AI-assisted code is judged like work by an experienced
  human engineer: focused, well typed, maintainable, and verified.

<a id="file-structure"></a>

## 📁 File structure

<a id="rule-1"></a>

### 1. Organize files by cohesive feature, not file type

> “Low coupling between layers, high cohesion within them.”
> — [Martin Fowler, *Layering Principles*](https://martinfowler.com/bliki/LayeringPrinciples.html)

For feature directories, this means keeping files that support the same behavior
close together while making dependencies between features explicit.

Apply the [LIFT principles](https://v17.angular.io/guide/styleguide#lift) to repository layout: **Locate** related code quickly, **Identify** a file's purpose from its name, keep the structure **Flat**, and **Try to be DRY** without hiding ownership. For this repository:

1. **Locate:** Contracts, implementation, styles, and tests **MUST** live near the behavior they support.
2. **Identify:** A directory **MUST** be named for its feature or
   responsibility. It **MUST NOT** be a category that mixes unrelated
   features, such as `hooks`, `types`, or `components`.
3. **Flat:** Directories **SHOULD** remain flat until a cohesive subfeature
   becomes easier to find in its own directory. A small, single-purpose
   feature **MAY** remain flat.
4. **Try to be DRY:** Shared logic **SHOULD** have one clear owner.
   Similar-looking code **SHOULD NOT** be combined when that obscures distinct
   responsibilities.
5. **Public surface:** Every encapsulating directory **MUST** have an
   `index.ts` exporting its actual public surface.

For a growing feature:

- **Module:** An operation file **SHOULD** contain one behavior, with its
  public contract in a descriptively named adjacent file.
- **Directory:** More than seven related files **SHOULD** prompt a search for a
  cohesive subfeature. A directory **MUST NOT** exist only to classify file
  kinds.
- **Utilities:** More than ten utility files, or files too long to scan,
  **SHOULD** prompt a split by responsibility.
- **Imports:** External callers **MUST** use the directory's `index.ts`;
  private siblings **MAY** import directly to avoid barrel cycles.

The [generated file details directory](packages/playground-ui/generated-file-details/) shows the feature-based layout.

**❌ Bad:** unrelated contracts collected solely because they are types.

```text
codegena-graph-view/
├── graph-interaction.types.ts
├── hooks/
└── components/
```

**👌 Acceptable:** a small implementation stays flat in its owner's directory
(excerpt).

```text
schema-convertors/
├── schema-convertor-array.ts
└── schema-convertor-array.spec.ts
```

**✅ Good:** a cohesive feature directory makes ownership and exports visible
(excerpt; `virtual-files/` contains several related files).

```text
generated-file-details/
├── generated-file-details.tsx
├── generated-file-details.props.ts
├── generated-file-details.styles.tsx
├── index.ts
└── virtual-files/
    ├── index.ts
    └── virtual-files.tsx
```

<a id="packages-and-package-dependencies"></a>

## 📦 Packages and package dependencies

<a id="rule-2"></a>

### 2. Keep package boundaries directional

- **Owner:** A reusable contract **MUST** live in the lowest package that can
  define it without importing a consumer. A local helper **SHOULD NOT** become
  a package merely because another caller might someday need it.
- **Imports:** Cross-package code **MUST** use the provider's public
  `@codegena/*` entrypoint. Private files **MUST NOT** be imported through a
  package's `src` or another unpublished path.
- **Framework boundary:** A framework-neutral library **MUST NOT** add React
  or MUI solely to reuse a visual concern. The [UI foundation](#concept-mui)
  belongs in UI projects.
- **Enforcement:** The active `@nx/enforce-module-boundaries` rule checks
  project imports and allowed tag relationships. The
  [dependency-direction ADR](adr/002-keep-package-dependencies-one-directional.md)
  explains the additional architectural direction: composition depends on
  contracts, not the reverse.

The [Nx project model](#concept-nx) explains why these boundaries follow
projects rather than directories alone.

**❌ Bad:** a consumer imports a package's private file.

```ts
// packages/playground-ui/src/lib/example.ts
import type { GraphPayload } from '@codegena/graph-core/src/graph-payload';
```

**✅ Good:** import the same contract from its public entrypoint.

```ts
// packages/playground-ui/src/lib/example.ts
import type { GraphPayload } from '@codegena/graph-core';
```

<a id="rule-3"></a>

### 3. Add external and workspace packages through their public APIs

- **Consumer manifest:** Every Nx project, including applications and E2E
  projects, **MUST** have its own `package.json`. Declare the packages its
  source, configuration, and commands consume there. Root installation or
  npm hoisting **MUST NOT** replace those declarations.
- **Existing API:** An adopted package's public API **MUST** be checked before
  adding another dependency or duplicating its behavior. Use the installed
  version's types and documentation when deciding what it supports.
- **New external package:** Its runtime role, compatibility, bundle impact,
  and existing alternatives **MUST** be reviewed. A new dependency **SHOULD**
  have a narrower purpose than a second framework for the same task.
- **New internal dependency:** The provider's public export and the consuming
  workspace manifest **MUST** agree. A TypeScript path alias alone **MUST NOT**
  stand in for a dependency. Use npm's workspace install command to link a
  missing package and update the lockfile.

**❌ Bad:** import a workspace package while omitting it from the consumer's
manifest.

```ts
// packages/playground-ui/src/lib/example.ts imports @codegena/graph-core,
// but packages/playground-ui/package.json omits that dependency.
import type { GraphPayload } from '@codegena/graph-core';
```

**✅ Good:** link the package, then import its public entrypoint.

```bash
npm install @codegena/graph-core --workspace @codegena/playground-ui
```

```ts
// packages/playground-ui/src/lib/example.ts
import type { GraphPayload } from '@codegena/graph-core';
```

See the [workspace linking workflow](.agents/skills/link-workspace-packages/SKILL.md).

<a id="rule-4"></a>

### 4. Remove unused package entries

- **Check usage:** Inspect production and dynamic imports, re-exports, tests,
  stories, mocks, fixtures, and published build helpers before removing an
  entry.
- **Remove unused entries:** A package with no use **SHOULD** be removed.
- **Keep required peers:** A package needed by TypeScript declarations or
  MUI's styling engine **MUST NOT** be removed solely because source files do
  not import it by name.

**❌ Bad:** keep `fs-extra` in OAS3 Core's peers when OAS3 Core has no use for it.

```json
{ "peerDependencies": { "fs-extra": "11.x", "lodash": "4.x" } }
```

**✅ Good:** remove the unused entry while retaining the needed peer.

```json
{ "peerDependencies": { "lodash": "4.x" } }
```

<a id="rule-5"></a>

### 5. Separate runtime packages from development tools

- **Development only:** Packages used only by tests, stories, mocks,
  fixtures, typings, or local build tooling **SHOULD** be in
  `devDependencies`. This applies to workspace packages too.
- **Runtime:** A package imported by published code **MUST NOT** be moved to
  `devDependencies` because tests also import it. Runtime workspace packages
  and external packages **MUST** follow the shared-runtime rule below.
- **UI packages:** MUI, Emotion, and other runtime UI libraries **MUST NOT**
  be in `devDependencies`. Applications and libraries declare shared packages
  as `peerDependencies`; the root supplies their concrete runtime versions.
  `@mui/material` and `@mui/x-tree-view` are runtime controls, not test tools.
- **Published tooling:** Packages loaded by an exported build or lint config
  are runtime dependencies of that tooling package. Projects using that
  config declare the tooling package in `devDependencies`.

**❌ Bad:** a theme imported only by Graph UI stories is a runtime dependency.

```json
{ "dependencies": { "@codegena/ui-theme": "^0.0.1" } }
```

**✅ Good:** keep the theme for stories without publishing it as Graph UI's
runtime dependency.

```json
{ "devDependencies": { "@codegena/ui-theme": "*" } }
```

<a id="rule-6"></a>

### 6. Use peerDependencies for shared runtime packages

- **Shared means:** A runtime package consumed by two or more Nx projects is
  shared. This includes workspace libraries and external packages; the root
  provider does not count as another consuming project.
- **Applications and private libraries:** Projects under `apps/` and
  non-publishable libraries **MUST** declare shared runtime packages in
  `peerDependencies`. Packages used by only that project belong in
  `dependencies`, unless a specific peer requirement applies below.
- **Publishable libraries:** They **SHOULD** prefer `peerDependencies` for
  shared runtime packages. They **MAY** use `dependencies` instead to simplify
  installation of the distributed library. Development tools remain
  `devDependencies`; sharing a test runner does not make it a runtime peer.
- **Unified toolkit:** Runtime packages listed in
  [`.unified-ui-packages.json`](.unified-ui-packages.json) **MUST** be peers in
  every consuming project, including applications. The root supplies their
  concrete versions in `dependencies`.
- **Tests and stories only:** Such a package **MUST NOT** become a peer when
  only development code uses it, except for the UI packages covered by rule 5.
- **Incompatible major:** A required version **MAY** stay a private runtime
  dependency when that choice is documented and verified.
- **Indirect requirement:** MUI's Emotion styling engine remains a required
  peer even when source files import MUI instead of Emotion.
- **Other consumer-owned packages:** `ansi-colors`, `ansi-to-react`, and
  `jsonc-parser` **MUST** also use major-only `peerDependencies` where used at
  runtime. They remain outside the unified UI list.

**❌ Bad:** ship a private React copy in a UI library.

```json
{ "dependencies": { "react": "19.0.0" } }
```

**✅ Good:** declare the shared React instance as a peer.

```json
{ "peerDependencies": { "react": "19.x" } }
```

Applications follow the same convention:

```json
{ "peerDependencies": { "react": "19.x", "@mui/material": "5.x" } }
```

See [Playground UI's manifest](packages/playground-ui/package.json) and the
[shared UI toolkit ADR](adr/005-standardize-react-ui-toolkit.md).

<a id="rule-7"></a>

### 7. Provide shared versions at the workspace root

- **Runtime providers:** Shared runtime packages and the unified toolkit
  **MUST** appear in the root `dependencies`. Shared development tools belong
  in root `devDependencies`. The root **MUST NOT** have `peerDependencies`.
- **Single consumer:** A runtime package with one consuming project belongs
  in that project's manifest and **MUST NOT** remain a direct root dependency
  unless it is in the unified list. Genuine development tools **MAY** remain
  at root with one consumer.
- **Project declarations:** Root declarations **MUST NOT** replace the
  consuming projects' manifests. npm hoisting changes installation paths,
  not dependency ownership.

**❌ Bad:** make the workspace root expect MUI from another consumer.

```json
{ "peerDependencies": { "@mui/material": "5.x" } }
```

**✅ Good:** provide MUI's concrete version at the root.

```json
{ "dependencies": { "@mui/material": "^5.18.0" } }
```

<a id="rule-8"></a>

### 8. Keep version ranges and workspace links consistent

- **External package:** If root `package.json` declares the same package, the
  library's `devDependencies` version **MUST** match that declaration exactly.
  If the root has no declaration, keep the required version or follow a
  comparable sibling library.
- **Workspace package:** A `@codegena/*` package used only for development
  **MUST** use `"*"` so npm links the local workspace package.
- **Consumer-owned runtime:** Peer dependencies **MUST** use major-only ranges
  such as `"19.x"` or `"5.x"`, not caret or exact versions. The major **MUST**
  match the compatible root or installed version.
- **Exception:** An existing intentional `"*"` peer **MAY** remain a wildcard.
  If a library requires a different major from the workspace version, it
  **MAY** use a private dependency instead; verify that it does not conflict
  with a consumer-owned singleton such as React.

**❌ Bad:** duplicate a different version of a root tool, or pin a workspace
story dependency to its current release.

```json
{
  "devDependencies": {
    "@codegena/ui-theme": "^0.0.1",
    "@playwright/test": "^1.35.0"
  }
}
```

**✅ Good:** use the local workspace link and the root's exact version.

```json
{
  "devDependencies": {
    "@codegena/ui-theme": "*",
    "@playwright/test": "^1.36.0"
  }
}
```

**❌ Bad:** constrain a consumer-owned UI package to one minor release.

```json
{ "peerDependencies": { "react": "^19.0.0", "@mui/material": "^5.18.0" } }
```

**✅ Good:** declare the compatible majors supplied by the consumer.

```json
{ "peerDependencies": { "react": "19.x", "@mui/material": "5.x" } }
```

The npm lockfile **MUST** be updated with a changed manifest. Affected Nx lint
and build targets **MUST** verify resolution; Storybook or tests **SHOULD** also
run when development dependencies move.

See the [dependency ownership decision](adr/016-declare-dependencies-in-consuming-projects.md)
for application, library, tooling, and root responsibilities.

<a id="rule-9"></a>

### 9. Publish focused secondary entrypoints

- **Purpose:** A secondary entrypoint **SHOULD** expose a cohesive part of a
  library when consumers do not need its broader root export graph. Importing
  that subpath gives bundlers a narrower module graph to process and helps keep
  unrelated code out of the resulting bundle. It does not guarantee a smaller
  bundle: side effects and the consumer's bundler still matter.
- **Local index:** A feature directory's `index.ts` **MUST** expose its real
  local public surface; its presence alone does not publish an npm entrypoint.
- **Published entrypoint:** A secondary package API **SHOULD** have a
  first-level directory such as `packages/oas3-core/json-schema/` with its own
  `index.ts`. The shared
  [Rollup factory](packages/infr-nx/rollup/create-unified-rollup-config.cjs)
  discovers those entrypoints and generates package exports.
- **Resolution:** A new entrypoint **MUST** be reflected in the canonical
  [TypeScript path mappings](tsconfig.base.json), built through the shared
  package config, and checked in the emitted package exports. Consumers
  **MUST** import the public subpath rather than an implementation file.
- **Scope:** Keep the root `src/index.ts` and published subpaths intentional.
  A subpath **SHOULD NOT** be published merely to shorten an import, and
  consumers **MUST NOT** import private implementation files.

**❌ Bad:** import one focused feature through the broad root entrypoint.

```ts
import { isSchemaString } from '@codegena/oas3-core';
```

**✅ Good:** publish and import the focused JSON Schema entrypoint.

```text
packages/oas3-core/
├── src/
│   └── index.ts
└── json-schema/
    ├── index.ts
    └── json-schema-type-guards.ts
```

```ts
import { isSchemaString } from '@codegena/oas3-core/json-schema';
```

See the [shared packaging ADR](adr/006-centralize-rollup-config-and-isolate-cli-resolution.md)
and [OAS3 Core's public entrypoint](packages/oas3-core/json-schema/index.ts).

<a id="security"></a>

## 🛡️ Security

These rules cover **all dependency types**, including development tools and
transitive packages. See the [dependency-audit decision](adr/017-check-dependencies-with-audit-ci.md)
for the audit workflow, exception format, and tool limitations. Source-level
security checks remain part of the [shared ESLint policy](adr/012-check-source-security-in-shared-eslint-policy.md).

<a id="rule-10"></a>

### 10. Never introduce a vulnerable dependency or version

- **🚫 New exposure:** A change **MUST NOT** add a package or resolve a new
  version with a known vulnerability, directly or transitively. This applies
  at every severity, including low.
- **🧾 Review the change:** Reviewers **MUST** check manifest and lockfile
  changes against current advisories. An existing exception **MUST NOT** be
  used to permit a newly added vulnerable package or version.
- **⛔ Pull requests:** A pull request introducing a vulnerable package or
  version **MUST** be rejected immediately. It can be reconsidered only after
  the vulnerable addition is removed or replaced with a patched version.

<a id="rule-11"></a>

### 11. Run the dependency audit after every feature

After implementing a feature, contributors **MUST** run Software Composition
Analysis (SCA) from the repository root before marking the work complete:

```bash
npm exec -- @codegena/audit-ci
```

- **✅ Required result:** The command **MUST** finish with exit code **0**.
  A failed request, timeout, or invalid report **MUST NOT** count as a clean
  audit.
- **🔎 Complete scope:** Development dependencies and low-severity findings
  **MUST NOT** be excluded merely to make the check pass.
- **📝 Report accurately:** Active exceptions remain visible in the output.
  An accepted finding **MUST NOT** be described as fixed or absent.

<a id="rule-12"></a>

### 12. Fix audit failures with patched releases

- **📦 Direct dependency:** Update the declaration in the consuming
  `package.json`, including the root provider when applicable. A direct
  dependency update **SHOULD NOT** be hidden in an override.
- **🔧 Transitive dependency:** When its parent does not yet select the fix,
  a narrow override in root `package.json` **MAY** select a patched version.
  Check compatibility with the callers that use it.
- **🔒 Preserve compatibility:** Prefer the smallest compatible patched
  update. Avoid disruptive toolchain upgrades and breaking changes when a
  compatible fix exists. An older release **MUST NOT** be treated as a fix
  solely because it falls outside the reported range; check its security
  history too.
- **👤 [🤖 AI only] Ask first:** Before updating `nx`, any `@nx/*` dependency,
  or making a breaking dependency change, an assistant **MUST** obtain human
  approval. An audit recommendation does not grant that approval.
- **🧪 Verify:** Update the lockfile, run affected Nx checks, then rerun the
  audit. A remaining failure **MUST** be resolved or qualify for the limited
  exception below before the feature is complete.

<a id="rule-13"></a>

### 13. Limit unpatchable dependency exceptions to two weeks

An exception **MAY** be added to
[`.vulnerabilities-ignore.json`](.vulnerabilities-ignore.json) **only when both
conditions hold**:

1. The affected package and version were already in use before the change.
2. No patched release is available. An inconvenient or breaking upgrade is
   not the same as an unavailable patch.

Every exception **MUST** follow these limits:

- **🎯 Narrow scope:** Use the specific GHSA advisory whenever possible.
  A CWE-wide entry **MUST NOT** exempt unrelated findings or bypass rule 10.
- **📅 Short expiry:** Set `expires` to a date no more than **14 days after
  the exception is granted or explicitly reviewed for renewal**. Use
  `YYYY-MM-DD`; expiry is midnight UTC at the start of that date.
- **📝 Explain the decision:** `description` **MUST** state the review date,
  why the dependency is retained, why no patch is available, and the relevant
  exposure or mitigation. Include an upstream advisory or issue link.
- **🔁 Recheck before renewal:** Recheck available releases before extending
  an exception. Automatic date extensions **MUST NOT** be used. Once a patch
  is available, the exception **MUST NOT** be renewed; apply the fix through
  rule 12 and remove the exception.
- **⏳ Keep it temporary:** Expired findings **MUST** fail the audit again.
  An exception accepts an existing risk for a limited time; it **MUST NOT**
  authorize a new vulnerable package or version.

**❌ Bad:** ignore every prototype-related advisory to allow a new vulnerable
dependency, or move an expiry forward after a patch is released.

**✅ Good:** retain an existing transitive package with no patched release,
record its specific advisory and exposure, and set an expiry within 14 days.

The [audit package README](packages/audit-ci/README.md#temporary-exceptions)
shows the JSON fields and an illustrative example. The
[ADR](adr/017-check-dependencies-with-audit-ci.md#temporary-exceptions) explains
the exception review process and the limits of a successful audit.

<a id="project-configuration"></a>

## 🛠 Project configuration

<a id="rule-14"></a>

### 14. Use Nx targets and keep workspace policy centralized

- **Find the project:** Its resolved Nx configuration **MUST** determine the
  available targets and dependencies. A package directory or a copied script
  **MUST NOT** stand in for that configuration.
- **Run its targets:** Checks **MUST** run through the workspace package
  manager and Nx. This preserves the project's configured inputs, dependencies,
  and task options.
- **Change shared policy once:** Workspace-wide ESLint, Rollup, and compiler
  conventions **SHOULD** change in [`packages/infr-nx`](packages/infr-nx/).
  A project-specific option **SHOULD** stay in its owning project instead of
  becoming everyone's default.
- **Keep lint scopes accurate:** Type-checked `typescript-eslint` rules
  **MUST** target TypeScript sources; React rules **MUST** target React sources.
  JavaScript tooling **MUST NOT** be treated as type-checked TypeScript.

The [Nx model](#concept-nx) explains project targets and the role of the
shared tooling package. The [linting model](#concept-typescript) explains why
the rule scopes differ. See also the [workspace tooling ADR](adr/007-keep-workspace-tooling-policy-in-infr-nx.md).

**❌ Bad:** bypass the project's Nx target when checking its lint policy.

```bash
cd packages/oas3-core && npx eslint .
```

**✅ Good:** inspect the project and use its target. A shared rule change
belongs in `packages/infr-nx/eslint-config/`.

```bash
npm exec -- nx show project @codegena/oas3-core --json
npm exec -- nx lint @codegena/oas3-core
```

<a id="rule-15"></a>

### 15. Choose Nx tags from the runtime role

The [Nx project model](#concept-nx) gives tags their context. The workspace's
[tag registry](packages/infr-nx/eslint-config/large-rules/global-nx-tags.mjs)
uses **two dimensions in one tag**:

- **Shape:** `<scope>:<qualifier>`.
- **Meaning:** The qualifier depends on the scope. In `application:frontend`,
  `frontend` names a runtime; in `ui:publishable`, `publishable` names a
  distribution choice.
- **Requirement:** A project **MUST** use a registered pair, never a bare scope
  or an invented combination.

Choose the pair in this order:

1. **Gather evidence from the project that runs or ships.** Inspect its
   resolved Nx project type and targets, package metadata, public entrypoints,
   production imports, and any Module Federation configuration. Test, mock,
   fixture, Storybook, and build-only imports **MUST NOT** determine the
   runtime scope. A name or directory alone **MUST NOT** determine the tag.
   Cross-check declared dependencies against imports: a dependency's section
   in `package.json` is evidence, not proof of where it runs.
2. **Choose the scope from the delivered behavior.** Use the first applicable
   role below. A library containing helpers for several roles **SHOULD** be
   classified by the API it actually exposes; if it exposes incompatible
   roles, **SHOULD** split those APIs into separately tagged projects.

   - `mf`: a Module Federation host, remote, or shared module. Federation
     configuration and exposed/consumed modules distinguish this from an
     ordinary application.
   - `application`: a standalone browser or server application. An E2E
     project targeting a browser application uses `application:frontend` even
     though its test runner executes in Node.js.
   - `nx`: a library whose public purpose is Nx generators, executors,
     migrations, or workspace tooling. A Rollup or Vite config used only to
     build another library does not make that library `nx`.
   - `router`: a library whose production API owns client-side routing;
     routing used only by a story does not qualify.
   - `ui`: React components, hooks tied to UI, or other browser/SSR view code.
   - `server`: a library whose primary production API requires a server
     runtime or server framework. Node APIs used only in build scripts, or
     an isolated CLI entrypoint beside a framework-neutral API, do not
     reclassify the whole library.
   - `pure`: a library with none of those runtime or tooling dependencies,
     such as schema models, transformations, and data structures.

3. **Choose the qualifier for that scope.** Do not treat qualifiers as a
   second, independent list of tags.

   - `application:frontend` runs a browser or SSR interface;
     `application:backend` runs a server application.
   - `mf:host` loads remotes; `mf:remote` exposes an application surface to a
     host; `mf:module` exposes a shared federation module.
   - For `router`, `ui`, `server`, `pure`, and `nx`, use `:publishable` when the
     library is intended to be distributed as its own package, and
     `:internal` when it is only a workspace implementation. Its own
     `package.json` alone **MUST NOT** decide this: inspect its public
     entrypoints, build/release setup, and intended consumers.

4. **Check the resulting boundary.** The pair **MUST** appear in
   `globalNxTagsNames`, and its intended imports **MUST** comply with the
   directional `depConstraints` in the same registry. For example,
   `ui:publishable` can depend on `pure:publishable`, but not
   `pure:internal`; `application:backend` cannot consume `ui:*`. A listed
   name without an applicable source constraint **SHOULD** be treated as a
   boundary-policy gap to resolve, not a reason to invent another tag.
   [`@nx/enforce-module-boundaries`](packages/infr-nx/eslint-config/large-rules/enforce-module-boundaries.config.mjs)
   is the import-policy authority; this guide **MUST NOT** duplicate its
   import-path rules. Cross-package contracts **SHOULD** have the lowest
   suitable owner and a public entrypoint. See the
   [dependency-direction ADR](adr/002-keep-package-dependencies-one-directional.md).
5. **Store and verify the primary pair.** Store one primary pair in the
   project's own configuration (`package.json` `nx.tags` or `project.json`
   `tags`) unless another explicit tag has a separate documented purpose.
   Inferred Nx tags such as `npm:public` do not replace that pair. A project
   resolving to inferred tags alone is missing its primary classification.
   Check resolved tags and dependencies, then run the project's lint target.

**❌ Bad:** classify a React component library as `pure` because it also
contains utility functions, or infer `publishable` from a manifest alone.

```json
{ "nx": { "tags": ["pure:publishable"] } }
```

**✅ Good:** classify its public component API as `ui` and confirm that the
package is intended for independent distribution.

```json
{ "nx": { "tags": ["ui:publishable"] } }
```

**[🤖 AI only]** Before proposing or changing a tag, inspect the complete
resolved project and the production imports; do not infer either dimension
from the project name, one dependency, or an existing tag. After editing,
compare the resolved tag and dependency graph with the registry and run lint.

```bash
npm exec -- nx show project @codegena/playground-ui --json
npm exec -- nx lint @codegena/playground-ui
```

<a id="rule-16"></a>

### 16. Give each TypeScript source set its own configuration

The [strict TypeScript model](#concept-typescript) starts at the root
[TypeScript base config](tsconfig.base.json), which owns shared compiler
options and package aliases. A library **MUST** keep its project references
and file globs aligned with the source sets it actually contains:

- **Project entrypoint:** `tsconfig.json` **SHOULD** extend the root base
  config, keep `files` and `include` empty, and reference its applicable
  source-set configs.
- **Production:** `tsconfig.lib.json` **MUST** include shipped sources and
  follow the [development-source boundary](#rule-17).
- **Tests:** A library with local unit tests **MUST** include them in a
  `tsconfig.spec.json`. A passing transpiled test or production build
  **MUST NOT** stand in for checking test types.
- **Storybook:** A library with local stories or Storybook configuration
  **MUST** give them a `tsconfig.storybook.json` and a project reference.
  A `ui:*` tag alone **MUST NOT** require Storybook; neither should a
  non-UI tag prohibit it when the project actually owns stories.
- **Overrides:** Package configs **MUST NOT** add local `paths` or `baseUrl`
  aliases or weaken inherited `strict` options. JSX, React, Emotion, MDX,
  test-runner types, and module settings **SHOULD** be overridden only for
  source sets that need them.

Use as reference: [playground-ui's configs](packages/playground-ui/tsconfig.json) for a
React library with Storybook, [oas3-core](packages/oas3-core/tsconfig.json) and
[oas3-visitor-typescript](packages/oas3-visitor-typescript/tsconfig.json) for non-UI libraries with tests,
and [Codegena NX Plugin](packages/infr-nx/tsconfig.json) for low-level workspace
tooling. The [configuration skill](.agents/skills/library-tsconfig-consistency/SKILL.md)
gives the inspection and verification steps.

<a id="rule-17"></a>

### 17. Exclude development sources from production TypeScript

- **Production boundary:** `tsconfig.lib.json` **MUST** exclude development-only
  files and directories matched by its `include` globs. This includes tests,
  stories, `__mocks__`, `__fixtures__`, `.storybook`, and purpose-specific
  helpers such as `story-utils` or `testing-utils` when they exist.
- **Development source sets:** An existing `tsconfig.spec.json` **MUST** include
  its tests and the TypeScript or JavaScript mocks, fixtures, and helpers those
  tests use. An existing `tsconfig.storybook.json` **MUST** do the same for
  stories, Storybook setup, and story helpers. A helper used by both belongs
  in both configs; a project **MUST NOT** gain an unused config.
- **Data fixtures:** Raw JSON, JSONC, and snapshot files are data, not
  TypeScript source files. Their directories **MUST** stay out of the
  production source set, but the data files **SHOULD NOT** be listed as root
  files in a TypeScript `include` merely to make them available at runtime.
- **Imports still matter:** TypeScript may follow an import into an excluded
  directory. Shipped sources **MUST NOT** import development-only helpers.

**❌ Bad:** excluding test files alone leaves their shared helpers in the
production compilation, while the spec project does not list those helpers.

```jsonc
// tsconfig.lib.json
{
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.spec.ts"]
}

// tsconfig.spec.json
{
  "include": ["src/**/*.spec.ts"]
}
```

**✅ Good:** for a library whose TypeScript fixtures are used by both tests and
stories, exclude development directories from production and include each
helper in the source sets that use it.

```jsonc
// tsconfig.lib.json
{
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": [
    "src/**/*.spec.ts",
    "src/**/*.spec.tsx",
    "src/**/*.stories.tsx",
    "src/**/__mocks__/**",
    "src/**/__fixtures__/**",
    "src/**/story-utils/**"
  ]
}

// tsconfig.spec.json
{
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.spec.tsx",
    "src/**/__mocks__/**/*.ts",
    "src/**/__fixtures__/**/*.ts"
  ]
}

// tsconfig.storybook.json
{
  "include": [
    "src/**/*.stories.tsx",
    "src/**/__fixtures__/**/*.ts",
    "src/**/story-utils/**/*.ts",
    ".storybook/*.ts"
  ]
}
```

<a id="typescript-rules"></a>

## 🔎 TypeScript rules

<a id="rule-18"></a>

### 18. Return early on invalid input

- **Control flow:** Related invalid cases **SHOULD** return early together so
  the successful path stays at one indentation level.
- **Spacing:** Independent `if` constructions **MUST** have a blank line
  between them; an `else` chain remains one construction.

The [OpenAPI guards](packages/oas3-core/oas3/oas3-type-guards.ts) show this pattern.

**❌ Bad:** nest the successful path.

```ts
if (operation) {
  if (operation.request) {
    return convert(operation);
  }
}

return null;
```

**✅ Good:** combine related invalid conditions in a guard.

```ts
if (!operation || !operation.request) {
  return null;
}

return convert(operation);
```

<a id="rule-19"></a>

### 19. Name a computed condition before using it

When a decision needs a collection search or compound expression, it
**SHOULD** be computed once and named for its intent. A repeated validation
**SHOULD** become a focused predicate. A direct primitive check **MAY** remain
inline.

**❌ Bad:** hide the search in the `if` condition.

```ts
if (parameters.some(({ parameter }) => parameter.in === 'cookie')) {
  return convert(operation);
}
```

**✅ Good:** the decision reads like its intent.

```ts
const hasCookieParameters = parameters.some(({ parameter }) => (
  parameter.in === 'cookie'
));

if (hasCookieParameters) {
  return convert(operation);
}
```

<a id="rule-20"></a>

### 20. Choose the collection operation by its result

- **Transform:** Operations **SHOULD** match their result: `map` for one-to-one,
  `filter` for selection, `flatMap` for zero-to-many, and `reduce` for
  aggregation.
- **Side effect:** `forEach` **MAY** perform synchronous side effects. It
  **SHOULD NOT** build a return value by mutating an outer variable when a
  collection operation is clearer.
- **Repeated lookup:** A supported `groupBy` API or one focused index **MAY**
  avoid repeated scans. A linear grouping pass **SHOULD NOT** become a scan
  per group just to eliminate mutation.
- **Loop choice:** Declarative operations **SHOULD** replace mutable
  `for`/`for...of`/`while` loops when they stay clear.

**❌ Bad:** mutate an external result while pretending to transform a collection.

```ts
const fileNames: string[] = [];
groups.forEach((group) => {
  fileNames.push(group.fileName);
});
```

**👌 Acceptable:** side effects are the purpose of the iteration.

```ts
groups.forEach((group) => {
  logger.info(group.fileName);
});
```

**✅ Good:** the returned collection is the expression.

```ts
const fileNames = groups.map(({ fileName }) => fileName);
```

For asynchronous work, code **MUST NOT** rely on `forEach` to await its
callback. Independent tasks **SHOULD** use `Promise.all(items.map(...))`.
Dependent tasks **MUST NOT** be placed in `Promise.all`; they **SHOULD** use a
focused sequential helper or promise-aware `reduce`.

<a id="rule-21"></a>

### 21. Move complex per-item logic into named functions

- **When to extract:** An iteration callback with multiple decisions, or one
  that creates or materially changes a feature-owned data type, **MUST** become
  a named pure function. A direct field projection **MAY** remain inline.
- **Where to put it:** The function **SHOULD** live beside the type or feature
  that owns the conversion. The outer collection operation **MUST** retain
  filtering, ordering, and grouping; the per-item function returns only the
  data needed for its specific result.
- **Contract:** A mapper **MUST** have typed inputs and an explicit return type.
  It **MUST NOT** mutate its input, update an outer collection, or perform a
  service or UI side effect. Required context **SHOULD** be passed explicitly.
- **Name:** Use `map<FromAspect>To<ToAspect>` (for example,
  `mapLogToCodegenaMarker`) or `map<NamedIteration>` when the destination is
  clear from the return type (for example, `mapResponseEntry`). Predicates and
  reducers **MUST** use names that describe their own operation, not a `map`
  prefix.

This refines the [collection-operation rule](#rule-20). The named function
makes a significant conversion easy to find and review; it is not a generic
mapping framework. See the [helper ownership rule](#rule-69).

**❌ Bad:** hide a conversion and its output contract inside the iteration.

```ts
const options = headers.map((header) => {
  const label = header.description?.trim() || header.name;
  return { label, value: header.name };
});
```

**✅ Good:** the collection reads as a mapping of one named domain operation.

```ts
function mapHeaderToOption(header: ResponseHeader): HeaderOption {
  const label = header.description?.trim() || header.name;

  return { label, value: header.name };
}

const options = headers.map(mapHeaderToOption);
```

<a id="rule-22"></a>

### 22. Name prepared values by what changed

A transformation **SHOULD** be computed once and reused in the branch that
tests it. Its name **SHOULD** reveal what changed: `titleTrimmed`,
`sortedFiles`, or `hasWarnings`.

**❌ Bad:** repeat work and conceal which form of a value is used.

```ts
if (annotations.title?.trim()) {
  lines.push(annotations.title.trim());
}
```

**✅ Good:** test and use the same prepared value.

```ts
const titleTrimmed = annotations.title?.trim();

if (titleTrimmed) {
  lines.push(titleTrimmed);
}
```

<a id="rule-23"></a>

### 23. Separate independent declarations

- **Group:** Short declarations that form one thought **SHOULD** stay together.
  An immediately dependent pair **MAY** stay together even if one is multiline.
- **Separate:** Independent multiline declarations, unrelated operations, and
  a declaration group followed by an unrelated `if`/`else` construction
  **MUST** have a blank line between them.

**❌ Bad:** independent multiline declarations run into each other.

```ts
const referencePath = isReferenceObject(response)
  ? getLocalReferencePath(response.$ref)
  : null;
const requestPath = isReferenceObject(request)
  ? getLocalReferencePath(request.$ref)
  : null;
```

**👌 Acceptable:** related one-line declarations form one step.

```ts
const hasWarnings = warningLogs.length > 0;
const hasFiles = visibleFiles.length > 0;
```

**✅ Good:** each substantial declaration has a visible boundary.

```ts
const referencePath = isReferenceObject(response)
  ? getLocalReferencePath(response.$ref)
  : null;

const requestPath = isReferenceObject(request)
  ? getLocalReferencePath(request.$ref)
  : null;
```

<a id="rule-24"></a>

### 24. Wrap expressions at meaningful boundaries

- **Assignment:** `=` **MUST** stay on the declaration line.
- **Line breaks:** Expressions **SHOULD** break at natural boundaries; roughly
  50 columns is a readability cue, not a second hard limit. A multiline
  callback **SHOULD** stay with its collection call.
- **Conditional initializer:** An ordinary multiline ternary **SHOULD** start
  after `=`. Parentheses **MAY** make room for a long typed declaration.

**❌ Bad:** strand `=` and compress the conditional.

```ts
const content: ContentTypeRecordTransitiveNode | undefined
  = contentNode?.type === 'contentTypeRecord' ? contentNode : undefined;
```

**✅ Good:** keep `=` with the declaration and break the same conditional at
its branches.

```ts
const content: ContentTypeRecordTransitiveNode | undefined = (
  contentNode?.type === 'contentTypeRecord'
    ? contentNode
    : undefined
);
```

<a id="rule-25"></a>

### 25. Join multiline messages from complete fragments

A fixed message split across source lines **SHOULD** keep each phrase complete
and join the phrases with an explicit separator. Spaces **SHOULD NOT** be
hidden at the end of a quoted fragment.

**❌ Bad:** the separator is easy to miss or remove while editing.

```ts
const explanation = 'Nested directories are hidden in Show all. '
  + 'Click to switch to Show selected.';
```

**✅ Good:** the separator and each phrase are visible.

```ts
const explanation = [
  'Nested directories are hidden in Show all.',
  'Click to switch to Show selected.',
].join(' ');
```

<a id="rule-26"></a>

### 26. Narrow unknown data through reusable guards

- **Input:** Parsed input **MUST** remain `unknown` until narrowed.
- **Type integrity:** New TypeScript code **MUST** preserve meaningful types;
  `any` or a cast **MUST NOT** replace validation merely to pass a check.
- **Guard:** A layer **MUST** be validated before accessing its fields; `in`
  **SHOULD** narrow object properties.
- **Reuse:** Existing aspect guards **SHOULD** replace repeated checks. Long
  guards **SHOULD** become named nested guards.
- **Boolean result:** When a possibly absent value must become a boolean,
  code **SHOULD** use `!!value` rather than `Boolean(value)`. Neither replaces
  the field and type checks needed by a type guard.

This rule is the input boundary for the [strict TypeScript model](#concept-typescript).
See the [schema-aspect ADR](packages/oas3-core/adr/003-model-schema-keywords-with-aspects-and-guards.md)
and [OpenAPI guards](packages/oas3-core/oas3/oas3-type-guards.ts).

**❌ Bad:** cast unknown data before reading its `$ref`.

```ts
// A type assertion does not validate the runtime value.
return processReference((value as { $ref: string }).$ref);
```

**✅ Good:** reuse the `$ref` guard before processing the same reference.

```ts
if (!isHasRef(value)) {
  return null;
}

return processReference(value.$ref);
```

<a id="rule-27"></a>

### 27. Model passive data with interfaces and companion functions

- **Data contract:** An object that only carries data **MUST** use an interface
  or discriminated union rather than a class with conversion methods.
- **Companions:** Put a focused `map...` function beside the contract when it
  needs conversion. Add an `is...` type guard **only** when an `unknown` input
  needs validation. These functions **MUST NOT** duplicate fields or another
  owner's responsibility.
- **Stored values:** Pass storage code the data it saves. Reuse the value's
  existing type when saving a single field, such as `ThemeMode`. A
  persisted-data type **MUST NOT** contain setters, callbacks, or services.
  See [hook result contracts](#rule-43).
- **Class boundary:** A class **MAY** own genuine identity, mutable state,
  lifecycle, or a required framework contract. Passive data alone is not a
  reason to introduce one.

See [mapper contracts](#rule-21) for naming and purity, and
[unknown-value narrowing](#rule-26) for guard design.

**❌ Bad:** wrap a data result in a class solely to host its conversion.

```ts
class OperationSummary {
  constructor(public label: string, public path: string) {}

  static from(operation: Operation): OperationSummary {
    return new OperationSummary(
      operation.operationId ?? `${operation.method} ${operation.path}`,
      operation.path,
    );
  }
}
```

**✅ Good:** keep the result shape and conversion separate.

```ts
interface OperationSummary {
  label: string;
  path: string;
}

function mapOperationToSummary(operation: Operation): OperationSummary {
  return {
    label: operation.operationId ?? `${operation.method} ${operation.path}`,
    path: operation.path,
  };
}
```

An `OperationSummary` read from `unknown` input may also have an
`isOperationSummary` guard; one produced only by the mapper does not need it.

<a id="rule-28"></a>

### 28. Use one absence value at a boundary

A local flow **SHOULD** choose either `null` or `undefined` for an absent
result. Equivalent absence values **MUST** be normalized at the boundary.
Callers **MUST NOT** handle both unless they mean different things.

**❌ Bad:** expose an unnecessary three-way type.

```ts
const header: StructureTransitiveNode | null | undefined = parseHeader();
```

**✅ Good:** normalize once.

```ts
const header: StructureTransitiveNode | null = parseHeader() ?? null;
```

<a id="rule-29"></a>

### 29. Carry narrowed types through the whole call

- **Variant:** An optional discriminated union **MUST** be present and narrowed
  before variant-specific fields are read. A helper **SHOULD** accept the
  narrowed subtype it actually uses.
- **Index signature:** Indexed `Record` values **MUST** use bracket access
  when `noPropertyAccessFromIndexSignature` applies.
- **Test type:** A Jest assertion **MUST NOT** be assumed to narrow TypeScript.
  Tests **SHOULD** guard optional collections or use `?? []` when an empty
  collection would still fail.

**❌ Bad:** the helper accepts more variants than its body can handle.

```ts
function renderContent(node: TransitiveNode): string {
  return Object.keys((node as ContentTypeRecordTransitiveNode).subTypes).join(', ');
}
```

**✅ Good:** narrow once and preserve the useful type.

```ts
function renderContent(node: ContentTypeRecordTransitiveNode): string {
  return Object.keys(node.subTypes).join(', ');
}

if (contentNode?.type !== 'contentTypeRecord') {
  return null;
}

return renderContent(contentNode);
```

<a id="rule-30"></a>

### 30. Document public contracts with multiline TSDoc

- **Purpose:** Comments **SHOULD** explain meaning, provenance, or a
  non-obvious constraint rather than narrate the next line.
- **Source:** A declaration implementing a specification **SHOULD** link its
  source with `{@link ...}`.
- **Form:** Public TSDoc **MUST** use the repository's multiline form, even
  for a short description. [OpenAPI model declarations](packages/oas3-core/oas3/)
  provide examples.

**❌ Bad:** a one-line comment repeats the identifier.

```ts
/** The operation method. */
export type OperationMethod = (typeof operationMethods)[number];
```

**👌 Acceptable:** no comment when the declaration already says enough.

```ts
export type OperationMethod = (typeof operationMethods)[number];
```

**✅ Good:** a public contract points to its source and clarifies its role.

```ts
/**
 * HTTP method accepted for an OpenAPI path operation.
 * See {@link https://spec.openapis.org/oas/latest.html#path-item-object}.
 */
export type OperationMethod = (typeof operationMethods)[number];
```

<a id="react-rules"></a>

## 🧩 React rules

Read from basic code structure to specialized behavior:

- **🧱 [Imports and composition](#rule-31):** Explicit types, ownership,
  and component boundaries.
- **🔁 [State and behavior](#rule-39):** Service-free views, shared state,
  controlled editors, owned hooks, and update handling.
- **📝 [Forms](#rule-47):** Field changes, validation, and dynamic metadata.
- **🎨 [Rendering and styles](#rule-49):** JSX, props, classes, and the theme.

<a id="rule-31"></a>

### 31. Import React types explicitly by name

- **🏷️ Named type imports:** React types **MUST** use explicit named type
  imports. Use `import type { ReactElement } from 'react'` for a type-only
  import, or `import { type ReactElement, useState } from 'react'` when the
  same file also needs runtime APIs. This applies to return types, props,
  refs, events, and hook contracts.
- **🚫 No React namespace:** Code **MUST NOT** use `React.JSX.Element`,
  `React.ReactNode`, `React.RefObject`, or other `React.*` references.
  The prohibition applies to both the global namespace and imported aliases.
  Default and namespace imports of `react` **MUST NOT** be used.
- **🧩 Preserve the contract:** Import `ReactElement` for JSX element output
  and `ReactNode` for renderable content. Keep a nullable result nullable,
  such as `ReactElement | null`. Global `JSX.Element` and an imported
  `JSX.Element` **MUST NOT** replace the named type import.
- **⚙️ Runtime values:** Hooks and other runtime APIs **MUST** use named
  value imports, such as `import { useState } from 'react'`.
  Import only the APIs the file uses.

**❌ Bad:** props and the return type depend on a React namespace import.

```tsx
import Typography from '@mui/material/Typography';
import type * as React from 'react';

interface CaptionProps {
  children: React.ReactNode;
}

export function Caption({ children }: CaptionProps): React.JSX.Element {
  return <Typography component="p">{children}</Typography>;
}
```

**✅ Good:** the same component imports each React type explicitly.

```tsx
import Typography from '@mui/material/Typography';
import type { ReactElement, ReactNode } from 'react';

interface CaptionProps {
  children: ReactNode;
}

export function Caption({ children }: CaptionProps): ReactElement {
  return <Typography component="p">{children}</Typography>;
}
```

<a id="rule-32"></a>

### 32. Keep the component hierarchy one-directional

Before moving a component, its parent, children, and independent siblings
**MUST** be identified.

- **Downward imports:** A parent **MAY** use a child. A child **MUST NOT** import
  its parent's component, props, styles, class names, or helpers.
- **Sibling independence:** Siblings **MUST NOT** borrow each other's private
  files. Shared contracts **SHOULD** move to a neutral adjacent module.
- **Changing values:** Data **SHOULD** flow through props and callbacks.

The [landing host lint rule](apps/landing-mf-host/eslint.config.mjs) checks
relative imports and re-exports. Imports into parent or sibling directories
**MUST** resolve to a public `index` entry point. For example, import
`../appearance` to use its public API.

**❌ Bad:** a toolbar reaches upward for its parent's private class map.

```tsx
// playground-topbar.tsx
// This child now depends on its parent's private styles.
import { playgroundClasses } from './playground.styles';

export function PlaygroundTopbar() {
  return <Box className={playgroundClasses.topbar}>Codegena</Box>;
}
```

**✅ Good:** the parent composes a child that owns its markup and styles.

```tsx
// playground-topbar.tsx
import { PlaygroundTopbarStyles } from './playground-topbar.styles';

export function PlaygroundTopbar() {
  return <PlaygroundTopbarStyles>Codegena</PlaygroundTopbarStyles>;
}
```

See the [Playground topbar](packages/playground-ui/playground/playground-topbar.tsx)
and its [styles](packages/playground-ui/playground/playground-topbar.styles.tsx).

<a id="rule-33"></a>

### 33. Name a component for its owner and purpose

- **Private child:** Its name **SHOULD** include the parent or feature and its
  role, such as `PlaygroundTopbar`.
- **Reusable component:** Its name **SHOULD** stand alone, such as
  `CodeEditor`.
- **Siblings:** Names **MUST** distinguish what each renders or does. `Panel`
  or `Content` **SHOULD NOT** substitute for a concrete purpose.
- **Rename:** Component, props, filename, and directory names **MUST** stay
  aligned.

**❌ Bad:** sibling names describe layout but not responsibility.

```text
playground/
├── playground-panel.tsx
├── playground-content.tsx
└── playground-section.tsx
```

**✅ Good:** the tree reveals the owner's distinct regions. Each subdirectory
groups several related files; a single child can stay beside its parent.

```text
playground/
├── playground-topbar.tsx
├── playground-topbar.styles.tsx
├── source-schema/
│   ├── index.ts
│   ├── playground-source-schema.tsx
│   └── playground-source-schema-copy-button.tsx
├── generated-output/
│   ├── index.ts
│   ├── playground-generated-output.tsx
│   └── playground-generated-output-header.tsx
└── file-details/
    ├── index.ts
    ├── playground-generated-file-details.tsx
    └── use-toolbar-buttons.tsx
```

The [Playground directory](packages/playground-ui/playground/)
demonstrates this relationship.

<a id="rule-34"></a>

### 34. Extract a responsibility before splitting a crowded file

- **Responsibility:** A distinct visual or behavioral responsibility
  **SHOULD** become a child even when it is short.
- **80-line review:** Roughly 80 lines of one purpose **SHOULD** prompt a
  component-boundary review.
- **150-line review:** Around 150 lines in one component **SHOULD** prompt a
  file-boundary review. These counts are review triggers, not quotas.

Applicable responsibilities **SHOULD** be separated into adjacent files:

- `<component-name>.tsx` **MUST** own rendering and component behavior.
- `<component-name>.props.ts` **SHOULD** own props and situational types;
  it **MUST NOT** import the implementation or styles.
- `<component-name>.styles.tsx` **SHOULD** own styles and class names;
  it **MUST NOT** import the implementation, but **MAY** import props types.
- `<component-name>.config.ts`, `.stories.tsx`, and `.spec.tsx` **MAY**
  hold substantial options, stories, or tests when those concerns exist.

Other files without JSX **MUST** use `.ts`; the established component styles
files use `.styles.tsx`. Empty companion files **MUST NOT** be created just to
complete the pattern.

**❌ Bad:** a long component mixes props, list transformation, row markup,
styles, and service calls in one implementation file.

```text
generated-file-details.tsx  (all responsibilities in one file)
```

**✅ Good:** the owner retains orchestration; cohesive children with their own
styles, exports, or stories have subdirectories (excerpt).

```text
generated-file-details/
├── generated-file-details.tsx
├── generated-file-details.props.ts
├── generated-file-details.styles.tsx
├── use-generated-file-details-content.ts
├── file/
│   ├── generated-file-details-file.tsx
│   ├── generated-file-details-file.styles.tsx
│   └── index.ts
├── placeholder/
│   ├── generated-file-details-placeholder.tsx
│   ├── generated-file-details-placeholder.styles.tsx
│   └── index.ts
└── index.ts
```

See the [generated file details feature](packages/playground-ui/generated-file-details/).

When a child becomes a distinct feature, its markup, styles, and stories
**SHOULD** move into its own named subdirectory. A hook that still coordinates
the parent's workflow **MUST** remain with the parent, even if it passes
values to that child.

<a id="rule-35"></a>

### 35. Give each component one implementation file

- **File:** Every component, including a small private child, **MUST** have
  one implementation file. A second component **MUST NOT** hide in that file.
- **Adjacent files:** Props and styles **MUST** be colocated with their
  component. Its `index.ts` **MUST** export only its public surface.
- **Boundary:** A child **MUST NOT** import parent-private styles or types.

See [`GeneratedFileDetails`](packages/playground-ui/generated-file-details/)
and [`WarningDetailedCodeLine`](packages/playground-ui/misc-ui/warning-detailed/warning-detailed-code-line.tsx).

**❌ Bad:** a parent defines the child and lends it private styles.

```tsx
function Playground() {
  function Header() {
    return <Box className={playgroundClasses.header}>Output</Box>;
  }

  return <Header />;
}
```

**✅ Good:** a child owns its markup and styles; the parent composes it.

```tsx
// panel-header/panel-header.tsx
import { PanelHeaderStyles } from './panel-header.styles';

export function PanelHeader({ title }: { title: string }) {
  return <PanelHeaderStyles>{title}</PanelHeaderStyles>;
}

// playground/playground.tsx
<PanelHeader title="Generated output" />;
```

<a id="rule-36"></a>

### 36. Share repeated markup through a component

- **Same view:** Repeated structure and styles **SHOULD** share a component
  that owns both.
- **Different views:** A CSS token **MAY** be shared when the structures have
  distinct responsibilities. A CSS helper **SHOULD NOT** leave the same markup
  duplicated.

See the [Playground component ADR](packages/playground-ui/adr/005-keep-feature-components-one-directional.md).

**❌ Bad:** share only styling while duplicating the same header structure.

```tsx
<Box css={getPanelHeaderCss(theme)}><Icon />{title}</Box>
<Box css={getPanelHeaderCss(theme)}><Icon />{otherTitle}</Box>
```

**✅ Good:** pass the differences into one owner.

```tsx
<PanelHeader
  icon={<Icon />}
  title={title}
/>
<PanelHeader
  icon={<Icon />}
  title={otherTitle}
/>
```

<a id="rule-37"></a>

### 37. Separate private display from reusable controls

- **Private display:** A fixed, one-caller view, such as an edge legend,
  **SHOULD** remain adjacent to its owner.
- **Shared control:** A reused interaction **SHOULD** move to a neutral
  directory with props for state, action, label, and placement. It **MUST NOT**
  refer to a caller's private state names.
- **Choice group:** Typed options **SHOULD** define the choices. The group
  **SHOULD** adapt UI-library events; its parent **MUST** own the chosen value.

**❌ Bad:** a reusable toggle encodes one parent's `sourceOpen` state.

```tsx
function SectionToggle({ sourceOpen, showSource }: PlaygroundProps) {
  return <Button onClick={showSource}>{sourceOpen ? 'Hide' : 'Show'}</Button>;
}
```

**✅ Good:** the shared control receives view state, placement, and an action;
its caller retains ownership of the panel state.

```tsx
interface PanelToggleProps {
  isOpen: boolean;
  isVisible: boolean;
  onToggle: () => void;
  position: 'left' | 'right';
  title: string;
}

<PanelToggle
  isOpen={sourceOpen}
  isVisible={canToggleSource}
  onToggle={toggleSource}
  position="left"
  title="source schema"
/>;
```

Compare the private [edge legend](packages/playground-ui/playground/generated-output/edge-type-legend.tsx)
with the reusable [panel toggle](packages/ui-unified/panels/panel-toggle/).

<a id="rule-38"></a>

### 38. Give a collection and its items separate owners

- **Collection:** It **MUST** own item mapping and layout.
- **Item:** It **MUST** own its markup, classes, and styles. A row with nested
  markup and conditional states **SHOULD** become a child, even with one caller.
- **Feature:** It **SHOULD** prepare sorting, selection, and navigation and
  pass narrow data and callbacks down. A reusable collection and item
  **SHOULD** move to a neutral level together.

**❌ Bad:** the list owns each row's markup and classes.

```tsx
// file-list.tsx
{files.map((file) => (
  <Box
    className={listClasses.fileRow}
    key={file.id}
  >
    <FileIcon />
    <Typography>{file.name}</Typography>
  </Box>
))}
```

**✅ Good:** the same row moves to its own component and styles.

```tsx
// file-list.tsx
import { FileRow } from './file-row';

{files.map((file) => (
  <FileRow
    file={file}
    key={file.id}
  />
))}

// file-row.tsx
import type { ReactElement } from 'react';

export function FileRow({ file }: FileRowProps): ReactElement {
  return (
    <Box className={fileRowClasses.root}>
      <FileIcon />
      <Typography>{file.name}</Typography>
    </Box>
  );
}
```

See [GeneratedFilesList](packages/playground-ui/generated-files-list/generated-files-list.tsx)
and its [file item](packages/playground-ui/generated-files-list/items/generated-files-list-file-item.tsx).

<a id="rule-39"></a>

### 39. Keep presentational components free of services

- **Container or feature hook:** It **SHOULD** subscribe to external state,
  call services, and map business rules to view-ready data and callbacks.
- **Presentational view:** It **MUST NOT** depend on a concrete transport,
  client, or store. It **MAY** own local display state such as expansion.
- **No ceremony:** A self-contained view **MAY** omit a container when there
  is no service wiring to separate.

Keep parent-managed values with their [shared-state owner](#rule-41).
A reusable [controlled editor](#rule-42) can encapsulate complex interaction
without taking ownership of a parent's services. Extract its substantial
behavior into [named hooks](#rule-43).

See the [component ownership ADR](packages/playground-ui/adr/005-keep-feature-components-one-directional.md)
and the [notification group container](packages/notification-ui-notistack/src/lib/notification-group-card/notification-group-card-container.tsx).

**❌ Bad:** a reusable card depends on a concrete service.

```tsx
function NotificationGroupCard({ transport }: {
  transport: NotistackNotificationTransport;
}) {
  return <Button onClick={() => transport.closeGrouped()}>Dismiss</Button>;
}
```

**✅ Good:** a named container owns the transport; the card receives a
callback. This excerpt shows the dismissal action only.

```tsx
// notification-group-card.tsx
import type { ReactElement } from 'react';

function NotificationGroupCard({
  onDismissGrouped,
}: NotificationGroupCardProps): ReactElement {
  return (
    <Button onClick={onDismissGrouped}>
      Dismiss
    </Button>
  );
}

// notification-group-card-container.tsx
import { type ReactElement, useCallback } from 'react';

function NotificationGroupCardContainer({
  transport,
}: NotificationGroupCardContainerProps): ReactElement {
  const handleDismissGrouped = useCallback((): void => {
    transport.closeGrouped();
  }, [transport]);

  return (
    <NotificationGroupCard
      onDismissGrouped={handleDismissGrouped}
    />
  );
}
```

<a id="rule-40"></a>

### 40. Avoid hidden side-effect dependencies in components

- **⚙️ Environment:** Application runtime configuration **MUST** be read and
  prepared in the application's `environment.ts`. Export ready-to-use values,
  such as `appBuildId` and `devModeEnv`, rather than raw configuration.
- **🔌 Startup only:** Static imports and re-exports of `environment.ts`
  **MUST** stay in startup. Dynamic imports remain unrestricted.
  `main.ts` and `bootstrap.tsx` **MUST** use its prepared exports; they
  **MUST NOT** read `process.env`, DefinePlugin globals such as
  `CODEGENA_BUILD_ID`, or other global configuration directly.
- **🧩 Components:** `App`, all child components, and hooks **MUST NOT** read
  global configuration or statically import `environment.ts`. Startup **MUST**
  pass prepared values through named props or explicit feature contexts.
  Build configuration may read environment values for its own work.
- **🧹 Enforcement:** `codegena/environment-boundary` reports environment and
  custom global reads outside `environment.ts`, plus static environment imports
  outside startup. Built-in globals and build configuration remain allowed.
- **🔌 Services:** A component or hook **MUST NOT** obtain a service, build ID,
  endpoint, or external store through an undeclared module singleton or global.
  Supply that dependency through props or a named feature provider mounted by
  the composition owner. A provider **MUST NOT** conceal environment reads.
- **♻️ Lifetime:** The owner that creates a service **MUST** release its
  subscriptions and unfinished work. A child receives data and actions;
  importing that child **MUST NOT** start a background service.
- **🌐 Browser APIs:** DOM and browser APIs used to implement a declared action
  remain valid. For example, a clipboard button may use the clipboard, and a
  resize hook may observe its element. Those APIs do not replace an explicit
  application dependency.

**❌ Bad:** the component reads the DefinePlugin-provided build ID directly.

```tsx
declare const CODEGENA_BUILD_ID: string;

function SearchFeature(): ReactElement {
  // Hidden input: the build ID is absent from this component's props.
  const appBuildId = CODEGENA_BUILD_ID;

  if (!appBuildId) {
    throw new Error('The app build ID is required.');
  }

  const source = useSearchSource(appBuildId);

  return <SearchView source={source} />;
}
```

**✅ Good:** `environment.ts` prepares the same value; startup passes it as a prop.

```tsx
// environment.ts
declare const CODEGENA_BUILD_ID: string;

export const appBuildId = CODEGENA_BUILD_ID;

if (!appBuildId) {
  throw new Error('The app build ID is required.');
}

// bootstrap.tsx
import { appBuildId } from './environment';

root.render(<App appBuildId={appBuildId} />);

// search-feature.tsx
interface SearchFeatureProps {
  appBuildId: string;
}

function SearchFeature({ appBuildId }: SearchFeatureProps): ReactElement {
  const source = useSearchSource(appBuildId);

  return <SearchView source={source} />;
}
```

`App` passes its prop to `SearchFeature`. `useSearchSource` owns setup and
cleanup. See the [landing environment](apps/landing-mf-host/src/environment.ts),
[bootstrap](apps/landing-mf-host/src/bootstrap.tsx)
and the [runtime composition decision](adr/015-compose-browser-runtime-explicitly.md).

<a id="rule-41"></a>

### 41. Keep shared state in the nearest coordinating feature

- **One owner:** State used by several views **MUST** belong to the nearest
  feature that coordinates them, such as
  [Playground](packages/playground-ui/playground/playground.tsx).
  Pass its values and actions to the children; do not lift it farther up
  without a shared need.
- **Presentational children:** Simple controls **SHOULD** display parent-owned
  state and request changes through callbacks. They **MUST NOT** keep another
  copy of that state or synchronize a copy with effects. See
  [service-free views](#rule-39).
- **Independent features:** A self-contained feature **MAY** own state that
  its surroundings do not need. For example, a reusable search drawer can own
  its query and highlighted suggestion. Do not move every such value into
  `Playground` or `App`. Expose a [controlled value](#rule-42) when a parent
  needs to read or change it.
- **Keep simple cases simple:** A local toggle **MAY** stay in its component.
  A new container or hook **SHOULD NOT** exist solely to hold one state setter.

See [hook extraction](#rule-43) for related state, effects, and handlers.

**Example:** `Playground` owns whether the details panel is open. Both a graph
selection and the details toggle can change that value.

**❌ Bad:** the toggle makes a second copy. Opening the panel through the
graph can leave the toggle reporting that the panel is still collapsed.

```tsx
function DetailsToggle({
  isDetailsOpen,
  onToggleDetails,
}: DetailsToggleProps): ReactElement {
  // Redundant copy: later parent updates will not change this state.
  const [isOpen, setIsOpen] = useState(isDetailsOpen);

  const handleToggle = useCallback((): void => {
    // One panel action now updates two independently stored values.
    setIsOpen((current) => !current);
    onToggleDetails();
  }, [onToggleDetails]);

  return (
    <Button
      aria-controls="generated-details"
      aria-expanded={isOpen}
      onClick={handleToggle}
    >
      Details
    </Button>
  );
}
```

**✅ Good:** the same toggle uses the parent's value and action directly.
It stays correct whichever action opened or closed the panel.

```tsx
import Button from '@mui/material/Button';
import type { ReactElement } from 'react';

interface DetailsToggleProps {
  isDetailsOpen: boolean;
  onToggleDetails: () => void;
}

function DetailsToggle({
  isDetailsOpen,
  onToggleDetails,
}: DetailsToggleProps): ReactElement {
  return (
    <Button
      aria-controls="generated-details"
      aria-expanded={isDetailsOpen}
      onClick={onToggleDetails}
    >
      Details
    </Button>
  );
}
```

The parent passes `detailsOpen` and `toggleDetailsPanel` from its layout hook.
The controlled panel has `id="generated-details"` in both versions. The real
[Playground](packages/playground-ui/playground/playground.tsx) owns
cross-panel coordination; the [React toolkit ADR](adr/005-standardize-react-ui-toolkit.md)
explains that ownership boundary.

<a id="rule-42"></a>

### 42. Encapsulate complex two-way editing in controlled components

A large component can edit objects, nested objects, or collections without
implementing every field and item action itself. Extract a coherent part,
such as `PlansEditor`, with one **`value` / `onChange` contract**.

- **Controlled value:** The parent **MUST** supply the current typed `value`.
  The editor **MUST** report a replacement value through `onChange` after a
  user edit. It **MUST NOT** mutate that value or keep a second authoritative
  copy. See [shared-state ownership](#rule-41).
- **Owned editing:** The editor **SHOULD** encapsulate its item controls,
  add/remove/reorder actions, and local display state. Substantial behavior
  belongs in its [named hooks](#rule-43). Its parent handles the complete
  document or workflow rather than the editor's internal actions.
- **Reusable contract:** The editor **MUST NOT** require one parent's form
  instance, concrete service, or separate setters for its internal fields.
  Options and validation results **MAY** be explicit props; `value` and
  `onChange` remain the value-update contract.
  Share an actually reused editor through its [owning entrypoint](#rule-2).
- **Composition and validation:** Controlled editors **SHOULD** compose through
  the same contract, including nested collections. This lets each editor be
  tested independently. A [form adapter](#rule-48) connects the editor to
  [form state and validation](#rule-47); submission and cross-field validation
  remain with the form.
- **Portable data:** Saved or shared values **SHOULD** be serializable objects
  or arrays with stable item IDs. Keep callbacks, services, refs, and temporary
  display state out of the value. An imperative third-party editor may need
  local synchronization; follow the [update-loop safeguards](#rule-45).

**Example:** billing settings contain `plans: Plan[]` alongside other billing
fields. Each plan has an `id` and `name`. The excerpts show only plan removal;
other billing fields stay unchanged.

**❌ Bad:** the billing component knows how individual plans are removed.
Adding more plan actions keeps expanding the parent.

```tsx
// Inside BillingSettings
// This per-plan action belongs in PlansEditor.
const handleRemovePlan = useCallback((id: string): void => {
  onChange({
    ...value,
    plans: value.plans.filter((plan) => plan.id !== id),
  });
}, [
  onChange,
  value,
]);

const renderedPlans = (
  <PlanList
    onRemovePlan={handleRemovePlan}
    plans={value.plans}
  />
);
```

**✅ Good:** the same billing component connects one controlled editor. It
only replaces the plans part of its value.

```tsx
// Inside BillingSettings
const handlePlansChange = useCallback((plans: Plan[]): void => {
  onChange({ ...value, plans });
}, [
  onChange,
  value,
]);

const renderedPlans = (
  <PlansEditor
    onChange={handlePlansChange}
    value={value.plans}
  />
);
```

`PlansEditor` now owns removal and can be used without billing settings.
This single handler is short enough to stay in the component.

```tsx
// plans-editor.tsx
import { type ReactElement, useCallback } from 'react';
import { PlanList } from './plan-list';
import type { Plan } from './plan';

interface PlansEditorProps {
  onChange: (value: Plan[]) => void;
  value: Plan[];
}

export function PlansEditor({
  onChange,
  value,
}: PlansEditorProps): ReactElement {
  const handleRemovePlan = useCallback((id: string): void => {
    onChange(value.filter((plan) => plan.id !== id));
  }, [
    onChange,
    value,
  ]);

  return (
    <PlanList
      onRemovePlan={handleRemovePlan}
      plans={value}
    />
  );
}
```

The parent still owns the plans array. The child owns how users edit it;
changing billing settings or testing the editor does not require duplicating
its editing behavior.

<a id="rule-43"></a>

### 43. Extract related state, effects, and handlers into named hooks

- **One behavior:** Related state, effects, handlers, refs, and subscriptions
  that form a substantial behavior **MUST** live together in a focused hook
  beside their owner. A component can compose several such hooks without
  containing each behavior's implementation.
- **Review trigger:** When **two or more related hook calls occupy seven or
  more source lines**, including their callbacks, contributors **SHOULD**
  consider extraction. This is a review trigger, not a quota: shorter complex
  behavior may need extraction, while unrelated hooks must not be bundled
  together.
- **Name the behavior:** Use names such as `useFileSelectionState` or
  `usePanelHeaderOverflow`, not `useComponentLogic`. Return the values, refs,
  and named actions the view needs; keep lifecycle flags private.
- **Describe the result:** A hook's return type **MUST** describe what callers
  can read or change. If callers always obtain the same values and actions
  together, use one hook and one result type. Pass only the saved value to
  storage as described in [rule 27](#rule-27).
- **Imperative UI:** A DOM measurement, the effect or observer that schedules
  it, its event handler, and cleanup **SHOULD** share one hook. Cleanup and
  dependencies **MUST** be preserved when moving the code.
- **State versus commands:** Ordinary changes **MUST** update the owned state
  directly, rather than increment a request counter or relay an object to
  make another view update its copy. A repeated imperative action or genuine
  asynchronous lifecycle **MAY** need a request marker; its owner **MUST**
  explain why it is needed.
- **Proportion:** A trivial handler **MAY** stay in the component, following
  the [callback rule](#rule-44). Pure calculations that need no React state or
  lifecycle **SHOULD** remain plain functions.

**❌ Bad:** saved preferences include an action, and two hooks expose the
same controls under different names.

```ts
interface AppearancePreferences {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

declare function useThemePreference(): AppearancePreferences;
declare function useAppearance(): AppearancePreferences;
```

**✅ Good:** the provider owns the state. One hook returns the mode and the
action to change it. Storage reads and writes the mode directly.

```ts
interface Appearance {
  readonly mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

declare function useAppearance(): Appearance;
declare function readThemePreference(): ThemeMode;
declare function writeThemePreference(mode: ThemeMode): void;
```

See the [appearance context](apps/landing-mf-host/src/app/appearance/appearance-context.ts)
and [provider](apps/landing-mf-host/src/app/appearance/appearance-provider.tsx).

Choose the [state owner](#rule-41) first. Extraction changes where its behavior
is implemented; it does not give every child its own state. A
[controlled editor](#rule-42) can use the same approach internally.

**Example:** a filename needs clipped-edge styling when its text overflows.
`FileNameStyles` supplies the same constrained width and overflow styles in
both versions.

**❌ Bad:** rendering the filename requires reading its measurement lifecycle
inside the component.

```tsx
function FileName({ name }: FileNameProps): ReactElement {
  // This overflow-measurement block belongs in useFileNameOverflow.
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const updateOverflow = useCallback((): void => {
    const element = textRef.current;

    if (!element) {
      return;
    }

    setIsOverflowing(element.scrollWidth > element.clientWidth);
  }, []);

  useEffect(() => {
    const element = textRef.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver(updateOverflow);

    observer.observe(element);
    updateOverflow();

    return () => observer.disconnect();
  }, [
    name,
    updateOverflow,
  ]);

  return (
    <FileNameStyles
      data-overflowed={isOverflowing}
      ref={textRef}
    >
      {name}
    </FileNameStyles>
  );
}
```

**✅ Good:** move that same state, ref, callback, effect, and cleanup into
`useFileNameOverflow`. The name explains the behavior at its call site.

```ts
// use-file-name-overflow.ts
import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

interface FileNameOverflow {
  isOverflowing: boolean;
  textRef: RefObject<HTMLSpanElement | null>;
}

export function useFileNameOverflow(name: string): FileNameOverflow {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const updateOverflow = useCallback((): void => {
    const element = textRef.current;

    if (!element) {
      return;
    }

    setIsOverflowing(element.scrollWidth > element.clientWidth);
  }, []);

  useEffect(() => {
    const element = textRef.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver(updateOverflow);

    observer.observe(element);
    updateOverflow();

    return () => observer.disconnect();
  }, [
    name,
    updateOverflow,
  ]);

  return { isOverflowing, textRef };
}
```

```tsx
// file-name.tsx
import type { ReactElement } from 'react';
import { FileNameStyles } from './file-name.styles';
import { useFileNameOverflow } from './use-file-name-overflow';

function FileName({ name }: FileNameProps): ReactElement {
  const {
    isOverflowing,
    textRef,
  } = useFileNameOverflow(name);

  return (
    <FileNameStyles
      data-overflowed={isOverflowing}
      ref={textRef}
    >
      {name}
    </FileNameStyles>
  );
}
```

For a complete implementation with resize and scroll handling, see the
[PanelHeader overflow hook](packages/ui-unified/panels/panel-header/use-panel-header-overflow.ts).

<a id="rule-44"></a>

### 44. Memoize derived data and local callbacks

- **Derived data:** Repeated traversal, indexing, deduplication, or parsing
  **SHOULD** use a focused `useMemo` or owning hook. Inputs **SHOULD** be the
  smallest useful set; intermediate collections **SHOULD** stay stable when
  another hook depends on them.
- **Derived JSX:** A conditional fragment mixing formatting and JSX **SHOULD**
  become a named, memoized React node before the main return.
- **Local functions:** A named function defined inside a component or custom
  hook **MUST** use `useCallback`. A pure function that needs no React values
  **SHOULD** move to module scope, where it needs no caching. This includes
  callbacks returned by hooks; iteration callbacks and callbacks passed into
  hooks are not separate local functions. Follow React's
  [dependency rules](https://react.dev/reference/react/useCallback#parameters).
- **Nested JSX props:** An event callback inside an object prop, such as
  `slotProps.iconContainer.onClick`, **MUST** reference a stable function.
  `react/jsx-no-bind` does not inspect that nested value.
- **Accessible names:** A multi-part label derived from changing props
  **SHOULD** be prepared outside JSX. Memoize it when the same contract is
  reused or referential stability matters; a trivial label needs no hook.
- **Formatting:** Multiple hook dependencies and multi-field result
  destructures **MUST** be vertical, one value per line with trailing commas.
- **Proportion:** Cheap expressions **MAY** remain inline. A hook **SHOULD NOT**
  exist merely to move a few lines. Use the [extraction criteria](#rule-43)
  when several hook calls implement one behavior.

**❌ Bad:** derive warning logs from all graph nodes on every render.

```tsx
// Repeats the graph scan even when its inputs have not changed.
const warningLogs = getWarningLogs(graphNodes, selectedFileIds);
```

**👌 Acceptable:** a cheap length check needs no memoization.

```tsx
const hasWarnings = warningLogs.length > 0;
```

**✅ Good:** memoize the meaningful transformation.

```tsx
const warningLogs = useMemo(() => getWarningLogs(
  graphNodes,
  selectedFileIds,
), [
  graphNodes,
  selectedFileIds,
]);
```

**❌ Bad — local callback:** the handler is recreated on every render.

```tsx
import type { ReactElement } from 'react';

function OpenButton({ onOpen }: OpenButtonProps): ReactElement {
  const handleOpen = (): void => {
    onOpen();
  };

  return <Button onClick={handleOpen}>Open</Button>;
}
```

**✅ Good — local callback:** `useCallback` retains the handler until its
dependency changes.

```tsx
import type { ReactElement } from 'react';

function OpenButton({ onOpen }: OpenButtonProps): ReactElement {
  const handleOpen = useCallback((): void => {
    onOpen();
  }, [onOpen]);

  return <Button onClick={handleOpen}>Open</Button>;
}
```

**❌ Bad — nested event prop:** the object hides a new callback on every render.

```tsx
<TreeItem
  slotProps={{
    iconContainer: {
      onClick: (event) => event.stopPropagation(),
    },
  }}
/>
```

**✅ Good — nested event prop:** the module-level handler is already stable.

```tsx
// At module scope
import type { SyntheticEvent } from 'react';

function stopPropagation(event: SyntheticEvent<HTMLElement>): void {
  event.stopPropagation();
}

// In the component
<TreeItem
  slotProps={{
    iconContainer: {
      onClick: stopPropagation,
    },
  }}
/>
```

<a id="rule-45"></a>

### 45. Stop controlled-state echoes at the owning boundary

When a parent controls several children, a child may report a prop-driven
update through the same callback it uses for a user edit. Relaying that report
to every child can start a reaction loop or repeat expensive work.

This rule covers synchronization of [controlled values](#rule-42), including
[form updates](#rule-47). It does not require ordinary controlled components
to keep another copy of their [parent's state](#rule-41).

**One-directional flow:** parent value → guarded child initialization → user
edit reported upward → parent comparison before rebroadcast. An equal external
value stops at the parent; a changed external value may require a guarded
child reinitialization.

- **Parent owns the value:** The shared owner **MUST** compare an incoming
  value with its current value before committing or broadcasting it. Structured
  values **MUST** use a comparator that reflects their domain meaning; equal
  updates **MUST** retain the current state reference. Callbacks observed by
  child effects **SHOULD** keep a stable identity.
- **🔒 Initialization gate:** If a child subscription cannot distinguish
  initial or parent-driven updates from user edits, it **SHOULD** guard its
  outward callback with a stable `mutableState.isInitialised` flag. The guard
  **MUST** reopen after the child's actual initialization step, not after an
  arbitrary timer.
- **Component-owned hook:** Complex change detection, initialization, and
  notification logic **SHOULD** live in a focused hook beside the component
  that owns it. The hook **SHOULD** expose named actions rather than its
  mutable flag; see [hook ownership](#rule-43).
- **Forced reinitialization:** A child hook **MAY** expose a narrow
  `resetIsInitialised` action when its parent must intentionally reapply an
  external value. The code starting reinitialization **MUST** close the guard
  before applying the value, and the child **MUST** have a known initialization
  step that reopens it. A value-only update that does not trigger that step
  **MUST NOT** leave the guard closed. For asynchronous initialization, the
  child **MUST** ignore stale completions after a newer value or unmount.
- **Proportion:** A simple controlled input that does not echo prop updates
  **MUST NOT** acquire a lock just for consistency. A timer **MUST NOT** be
  used to conceal the loop; see [interaction scheduling](#rule-46).

**❌ Bad:** the parent rebroadcasts equal values and the child reports its
own reset as another edit.

```tsx
// Parent
const handleChildUpdate = (next: FormValue): void => {
  // An equal structured value can still have a different object reference.
  setValue(next);
};

// Child hook
useEffect(() => {
  const unsubscribe = widget.subscribe(onChange);
  // Reset notifications are sent back to the parent as if they were user edits.
  widget.reset(value);

  return unsubscribe;
}, [
  onChange,
  value,
  widget,
]);
```

**✅ Good:** the parent rejects equal values; the child closes its notification
gate while applying a changed parent value.
Here, `widget.subscribe` returns an unsubscribe function and `widget.reset`
applies the value and reports changes synchronously.

```tsx
// Parent: preserve the current state when the child reports an echo.
const handleChildUpdate = useCallback((next: FormValue): void => {
  setValue((current) => (
    isSameFormValue(current, next) ? current : next
  ));
}, []);

// Inside the child hook: synchronize when the parent value changes.
const mutableState = useRef({ isInitialised: false });

useEffect(() => {
  mutableState.current.isInitialised = false;

  const unsubscribe = widget.subscribe((next: FormValue) => {
    if (mutableState.current.isInitialised) {
      onChange(next);
    }
  });

  if (!isSameFormValue(widget.getValue(), value)) {
    widget.reset(value);
  }

  mutableState.current.isInitialised = true;

  return unsubscribe;
}, [
  onChange,
  value,
  widget,
]);
```

`reset` completes inside this effect, so reopening the gate after the call is
safe. A React state setter or an asynchronous reset does not provide the same
completion guarantee; reopen the gate when that initialization actually
finishes.

**More info:** The [source hook](https://github.com/koshevy/bot-store/blob/main/libs/ui-dynamic-form/src/lib/use-track-dynamic-value.ts)
demonstrates the flag with a stable `useState` object and exposes
`resetIsInitialised`; the example above uses a ref to make the non-rendering
purpose explicit. Its current consumer does not call that reset action. A
parent comparator and a matched reinitialization step are required when
adapting the idea to a composed feature. See the
[live form playground](https://koshevy.github.io/bot-store/?path=/story/bot-subscription-seller-control-panel-container--successful-start-and-update-playground)
for a start, edit, and revert path.

<a id="rule-46"></a>

### 46. Defer only coupled UI work that blocks an interaction

- **Coupled action:** When one event updates several expensive views,
  substantial downstream work **SHOULD** run after the originating event.
  Values **MUST** be captured first; the feature owner **SHOULD** defer once
  with `setTimeout(..., 0)`.
- **Local action:** A simple display toggle **SHOULD** remain synchronous.
- **Limit:** A timer **MUST NOT** hide an expensive render or feedback loop.

See the [interaction scheduling ADR](adr/010-defer-coupled-ui-work-after-interactions.md).

**❌ Bad:** one click runs all coupled updates in its event task.

```tsx
const handleSelect = (nodeId: string, additive: boolean): void => {
  updateSelection(nodeId, additive);
  revealSource(nodeId);
  scrollDetails(nodeId);
};
```

**👌 Acceptable:** keep a local display toggle synchronous.

```tsx
const handleExpand = (): void => {
  setExpanded((current) => !current);
};
```

**✅ Good:** defer those same updates together after the click.

```tsx
const handleSelect = (nodeId: string, additive: boolean): void => {
  setTimeout(() => {
    updateSelection(nodeId, additive);
    revealSource(nodeId);
    scrollDetails(nodeId);
  }, 0);
};
```

<a id="rule-47"></a>

### 47. Track simple form changes with React Hook Form

- **Form state:** Use `useForm` for values, validation, and submission. Supply
  `defaultValues` so the initial value of each watched field is clear.
- **Render:** Use `watch('fieldName')` for a small form's conditional UI.
  Use `useWatch` in a child when only that child needs to re-render.
- **Notify:** Use `subscribe` for value changes needed outside rendering,
  such as saving a draft. Subscribe to only the needed fields or form state
  and return the unsubscribe function from the effect.
- **External values:** `reset` and `setValue` can also trigger notifications.
  When the parent sends values back to the form, compare and guard that path
  as described in [rule 45](#rule-45).
- **Validation:** Field rules **MAY** be declared with the fields. Schema or
  cross-field validation **SHOULD** use a resolver, such as the adopted
  `@hookform/resolvers`, instead of a parallel error-state engine.

Keep complex field editors reusable through [value and onChange](#rule-42).
Use an [adapter](#rule-48) for form-specific wiring and an
[owned hook](#rule-43) for substantial subscriptions or change handling.

**❌ Bad:** watch the whole form to drive one field's UI and draft saving.

```tsx
const { watch } = useForm<ProfileValues>({
  defaultValues: { email: '', wantsEmail: false },
});
// Every field change re-renders this component; the UI needs only wantsEmail.
const values = watch();
const wantsEmail = values.wantsEmail;

useEffect(() => {
  saveDraft(values);
}, [
  saveDraft,
  values,
]);

const renderedEmailField = wantsEmail && <EmailField />;

return renderedEmailField;
```

**✅ Good:** watch only the UI field; save the initial draft and subscribe to
later changes.

```tsx
const {
  getValues,
  subscribe,
  watch,
} = useForm<ProfileValues>({
  defaultValues: { email: '', wantsEmail: false },
});

const wantsEmail = watch('wantsEmail');

useEffect(() => {
  saveDraft(getValues());

  return subscribe({
    formState: { values: true },
    callback: ({ values }) => saveDraft(values),
  });
}, [
  getValues,
  saveDraft,
  subscribe,
]);

const renderedEmailField = wantsEmail && <EmailField />;

return renderedEmailField;
```

**More info:** The reference [preferences form](https://github.com/koshevy/bot-store/blob/main/libs/bot-subscription-seller-ui/src/lib/preferences-form/preferences-form.tsx)
uses `watch` with a callback and cleans up its subscription. That overload is
deprecated in favor of `subscribe`. See the React Hook Form
[watch](https://react-hook-form.com/docs/useform/watch),
[useWatch](https://react-hook-form.com/docs/usewatch), and
[subscribe](https://react-hook-form.com/docs/useform/subscribe) APIs.

<a id="rule-48"></a>

### 48. Describe dynamic form widgets with typed metadata

- **Widget contract:** Dynamic form widgets **SHOULD** share a typed interface
  based on React Hook Form's `ControllerRenderProps`. Keep form-specific
  adapters around reusable widgets when they need additional field props.
- **Field behavior:** The adapter **MUST** connect the field's value, change,
  blur, name, and ref to the underlying control as appropriate, so form
  validation and focus remain available.
- **Metadata:** A widget registry **SHOULD** map a control kind to its
  component and defaults. It **MAY** also describe prop validation and error
  mapping. Field definitions **SHOULD** supply the field name, label, and
  rules without holding the current field value.
- **Integration:** A renderer **SHOULD** resolve the metadata and connect the
  widget through `Controller`. Use `FormProvider` when nested renderers need
  the form context and `useFieldArray` for repeated form fields.
- **Stable definitions:** Static metadata **SHOULD** live outside the
  component. Memoize derived definitions when subscriptions depend on their
  identity; see [derived data](#rule-44).

The reusable [controlled editor](#rule-42) keeps its value/onChange API;
the adapter owns the [form integration](#rule-47). Extract substantial
adapter behavior into its own [named hook](#rule-43).

**❌ Bad:** a reusable dynamic form chooses controls by individual field name,
so every new form requires another branch.

```tsx
if (name === 'profileName') {
  return (
    <TextField
      label="Profile name"
    />
  );
}
```

**✅ Good:** a reusable generic contract describes the field props. This
example registers a text widget for one field and selects it by kind.

```tsx
import { type ComponentType, useCallback } from 'react';
import {
  Controller,
  type ControllerProps,
  type ControllerRenderProps,
  type FieldPath,
  type FieldPathValue,
  type FieldValues,
} from 'react-hook-form';

// Module scope: shared contracts and static definitions.
interface WidgetProps<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
> extends ControllerRenderProps<TValues, TName> {
  label: string;
}

interface WidgetMeta<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
> {
  Component: ComponentType<WidgetProps<TValues, TName>>;
  defaultValue: FieldPathValue<TValues, TName>;
}

const widgets: Record<'text', WidgetMeta<ProfileValues, 'profileName'>> = {
  text: { Component: TextWidget, defaultValue: '' },
};

const fieldDefinition = {
  kind: 'text',
  label: 'Profile name',
  name: 'profileName',
} as const;

// Inside the form renderer.
const {
  Component: Widget,
  defaultValue,
} = widgets[fieldDefinition.kind];

const renderWidget = useCallback<
  ControllerProps<ProfileValues, 'profileName'>['render']
>(({ field }) => (
  <Widget
    {...field}
    label={fieldDefinition.label}
  />
), [Widget]);

<Controller
  control={control}
  defaultValue={defaultValue}
  name={fieldDefinition.name}
  render={renderWidget}
/>
```

**More info:** The reference [widget contract](https://github.com/koshevy/bot-store/blob/main/libs/ui-dynamic-form/src/lib/widget.ts)
extends `ControllerRenderProps`. Its
[widget metadata](https://github.com/koshevy/bot-store/blob/main/libs/ui-dynamic-form/src/lib/widget-meta.ts)
describes the constructor and defaults; its
[dynamic form](https://github.com/koshevy/bot-store/blob/main/libs/ui-dynamic-form/src/lib/dynamic-form.tsx)
and [widget renderer](https://github.com/koshevy/bot-store/blob/main/libs/ui-dynamic-form/src/lib/widget-renderer.tsx)
compose them. See also React Hook Form's
[Controller](https://react-hook-form.com/docs/usecontroller/controller) and
[useFieldArray](https://react-hook-form.com/docs/usefieldarray) APIs.

<a id="rule-49"></a>

### 49. Name conditions and prepare conditional child nodes

- **Conditional child:** A component **MUST** assign a conditionally rendered
  child to a named value before `return`. The returned JSX **MUST** use that
  value rather than wrap the child in an inline `&&` or ternary.
- **Rendered node name:** A variable holding JSX **MUST** start with `rendered`
  followed by the part it contains, such as `renderedIcon`. This distinguishes
  a prepared node from a component reference or data value. The same name
  applies to conditional and memoized JSX.
- **Decision:** A condition with multiple terms **SHOULD** have its own
  intention-revealing name before it is used in a JSX prop or creates a child.
- **Boolean prop:** A direct boolean prop **MAY** remain inline; it does not
  conditionally create a child node.

**❌ Bad — compound decision:** the visibility rule is buried in the node
expression.

```tsx
const renderedWarningShortcut = hasWarnings && !hasVisibleWarning && (
  <Button onClick={scrollToWarnings}>Has warnings</Button>
);

return <>{renderedWarningShortcut}</>;
```

**✅ Good — compound decision:** name the reason to show the child separately.

```tsx
const hasToShowWarningShortcut = hasWarnings && !hasVisibleWarning;
const renderedWarningShortcut = hasToShowWarningShortcut && (
  <Button onClick={scrollToWarnings}>Has warnings</Button>
);

return <>{renderedWarningShortcut}</>;
```

**❌ Bad — rendered node name:** `icon` does not distinguish a React node from
an icon component or icon data.

```tsx
const Icon = iconsBySeverity[severity];
const icon = (
  <Icon
    aria-hidden
    size={15}
  />
);
```

**✅ Good — rendered node name:** the component reference and rendered node
have distinct names.

```tsx
const Icon = iconsBySeverity[severity];
const renderedIcon = (
  <Icon
    aria-hidden
    size={15}
  />
);
```

**❌ Bad — conditional child:** the child is constructed inside the returned
tree.

```tsx
return (
  <>
    {hasHiddenNestedDirectories && (
      <PlaygroundGeneratedFileDetailsDirectoryNotice
        onClick={handleShowSelected}
      />
    )}
  </>
);
```

**✅ Good — conditional child:** prepare the child before the returned tree.

```tsx
const renderedDirectoryNotice = hasHiddenNestedDirectories && (
  <PlaygroundGeneratedFileDetailsDirectoryNotice
    onClick={handleShowSelected}
  />
);

return <>{renderedDirectoryNotice}</>;
```

**❌ Bad — compound prop:** the prop hides a separate visibility decision.

```tsx
<Collapse
  in={isDetailsExpanded && hasDetailsToShow}
>
  {children}
</Collapse>
```

**✅ Good — compound prop:** name the decision before passing it to the prop.

```tsx
const hasToShowDetails = isDetailsExpanded && hasDetailsToShow;

<Collapse in={hasToShowDetails}>{children}</Collapse>
```

**👌 Acceptable — boolean prop:** a direct boolean prop does not create a
conditional child.

```tsx
<Collapse in={expanded}>{children}</Collapse>
```

<a id="rule-50"></a>

### 50. Put multiple JSX props on separate lines

JSX with two or more props, or one prop longer than 32 characters, **MUST** put each prop on its own line. The closing `>` **MUST** be on its own line. See [the warning code-line component](packages/playground-ui/misc-ui/warning-detailed/warning-detailed-code-line.tsx).

**❌ Bad:** compress several props into one row.

```tsx
<Box className={classes.lineNumber} component="span">{label}</Box>
```

**👌 Acceptable:** one short prop stays on one line.

```tsx
<Box component="span">{label}</Box>
```

**✅ Good:** each prop is independently visible.

```tsx
<Box
  className={classes.lineNumber}
  component="span"
>
  {label}
</Box>
```

<a id="rule-51"></a>

### 51. Omit optional props instead of passing empty values

- **Absence:** A prop **MUST** be optional when omission is valid. Callers
  **MUST NOT** pass `""` or `[]` just to satisfy its type.
- **Default:** It **SHOULD** be defined only when every caller should receive
  it.
- **Boundary:** View props **SHOULD** describe items, display state, and
  callbacks; a feature owner **SHOULD** adapt service methods to that API.

**❌ Bad:** an empty title has no meaning to the list.

```tsx
interface GeneratedFilesListProps {
  graph: GraphPayload;
  title: string;
}

<GeneratedFilesList
  graph={graph}
  title=""
/>
```

**✅ Good:** the prop is omitted; its type allows omission.

```tsx
interface GeneratedFilesListProps {
  graph: GraphPayload;
  title?: string;
}

<GeneratedFilesList graph={graph} />
```

<a id="rule-52"></a>

### 52. Compose conditional classes with `clsx`

Class names **MUST** be owned by their component. Conditional classes **MUST**
use object-form `clsx`. A single unconditional class **MAY** be passed
directly.

**❌ Bad:** assemble classes by filtering and joining strings.

```tsx
className={[classes.root, active && classes.active].filter(Boolean).join(' ')}
```

**👌 Acceptable:** one unconditional class needs no `clsx`.

```tsx
className={classes.root}
```

**✅ Good:** the class map makes every condition explicit.

```tsx
className={clsx({
  [classes.root]: true,
  [classes.active]: active,
})}
```

<a id="rule-53"></a>

### 53. Use the shared MUI theme and keep styles beside components

- **UI foundation:** React UI projects **MUST** use
  [`@codegena/ui-theme`](packages/ui-theme/) for their shared palette and
  typography and MUI for general controls.
- **Theme colors:** Styles **SHOULD** derive colors from the active MUI theme.
  When transparency or a tone adjustment is needed, they **SHOULD** use
  `alpha`, `lighten`, or `darken` with palette values. They **SHOULD NOT**
  hard-code an unrelated color for the same visual role.
- **Local MUI/Emotion convention:** A component's adjacent styles file
  **SHOULD** import `styled` from `@mui/material/styles`, wrap a MUI
  component, and write CSS in a template string marked
  `// language=postcss`. The shared lint target checks these strings with
  Stylelint and warns about object-form `styled` CSS. Direct hex colors in
  these strings are rejected; use theme palette values instead.
- **Owned classes:** That styles file **MAY** export the component's class-name
  map, such as `panelHeaderClasses` from `panel-header.styles.tsx`. A child
  **MUST NOT** import a parent's private classes or styles.
- **One logical root:** Sections of the same component **SHOULD** be styled
  through class selectors under its main styled root. An extra styled wrapper
  **SHOULD NOT** be created merely to hold CSS for a nearby section. A
  separate component **SHOULD** own its own styled root when it has a
  separate responsibility.

The [MUI and theme overview](#concept-mui) explains this foundation. See
[PanelHeader styles](packages/ui-unified/panels/panel-header/panel-header.styles.tsx)
for a theme-aware implementation.

**❌ Bad:** `PanelHeader` reaches into `Playground`'s styles. The import
points upward to another component's private file.

```tsx
// panel-header.tsx
import { playgroundClasses } from '../../playground/playground.styles';
```

**✅ Good:** `PanelHeader` imports its adjacent styles file. That file owns
the classes and styled root used by `PanelHeader`.

```tsx
// panel-header.styles.tsx
import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

export const panelHeaderClasses = {
  leading: 'PanelHeader__leading',
} as const;

// language=postcss
export const PanelHeaderStyles = styled(Box)(({ theme }) => `
  background-color: ${alpha(theme.palette.background.paper, 0.6)};

  .${panelHeaderClasses.leading} {
    gap: ${theme.spacing(1)};
  }
`);
```

```tsx
// panel-header.tsx
import Box from '@mui/material/Box';
import type { ReactElement } from 'react';
import {
  panelHeaderClasses,
  PanelHeaderStyles,
} from './panel-header.styles';

export function PanelHeader({ leading }: PanelHeaderProps): ReactElement {
  const renderedLeading = leading && (
    <Box
      className={panelHeaderClasses.leading}
    >
      {leading}
    </Box>
  );

  return (
    <PanelHeaderStyles>
      {renderedLeading}
    </PanelHeaderStyles>
  );
}
```

<a id="accessibility"></a>

## ♿ Accessibility

<a id="rule-54"></a>

### 54. Reuse controls with built-in accessibility

- **Match the purpose:** The control's semantics **MUST** match what it does:
  use a button for an action, a link for navigation, a menu for a list of
  actions or choices, and a tree for hierarchical selection. Visual
  resemblance alone does not make one control interchangeable with another.
- **Reuse first:** An interaction **SHOULD** use a native HTML control or an
  adopted component that already provides its role, keyboard operation, and
  focus behavior. An ARIA role on a plain element does not add that behavior.
- **Project default:** MUI is this repository's underlying UI toolkit.
  `Button`, `IconButton`, `Menu`, and MUI X Tree View **SHOULD** be preferred
  for their matching use cases. Their built-in accessibility support is a
  starting point: callers **MUST** supply any missing accessible name and
  application-specific names and state described in rules
  [55](#rule-55) and [56](#rule-56).
- **Custom fallback:** When a graph or editor genuinely needs a custom
  control, its owner **MUST** implement the relevant role, keyboard operation,
  focus management, and state. Decorative elements **MUST NOT** become extra
  tab stops merely to make an action clickable.

See the [shared UI toolkit ADR](adr/005-standardize-react-ui-toolkit.md),
[MUI Tree View accessibility guidance](https://mui.com/x/react-tree-view/accessibility/),
and [WAI-ARIA's guidance on semantic controls](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/).

**❌ Bad:** a clickable box claims to be a button but does not respond to
button keys.

```tsx
<Box
  onClick={handleCopy}
  role="button"
>
  Copy schema
</Box>
```

**✅ Good:** the adopted MUI button already supplies the expected button
behavior; the feature supplies its action.

```tsx
import Button from '@mui/material/Button';

<Button onClick={handleCopy}>
  Copy schema
</Button>
```

<a id="rule-55"></a>

### 55. Give controls specific, distinct accessible names

- **Visible label first:** A control **SHOULD** get its accessible name from
  visible text when that text describes the action. An icon-only control
  **MUST** receive a descriptive name through `aria-label` or
  `aria-labelledby`; a tooltip **MUST NOT** be its only name.
- **Distinct targets:** Repeated controls **MUST** include the relevant
  source, file, or declaration in their accessible names so each action can
  be distinguished from its neighbors. Generic labels such as "Open" or
  "Copy" **MUST NOT** be reused for different targets in the same view.
- **Count badges:** A read-only count used as a distinct result **MUST** have
  a suitable role and a name that includes its scope and current value.
  Name the information, such as "Generated output: 2 files total", rather
  than its visual shape, such as "file chip".
- **Icon:** An icon that repeats its control's meaning **SHOULD** use
  `aria-hidden`. A standalone meaningful image **SHOULD** have its own name
  instead.

See [WAI-ARIA's naming guidance](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)
and the [declaration glyph](packages/playground-ui/json-editor/declaration-glyph.tsx).
Verify these names through the [accessible UI testing rule](#rule-60).

**❌ Bad:** every button announces the same vague action.

```tsx
{files.map((file) => (
  <IconButton
    aria-label="Open"
    key={file.relativeFilePath}
    onClick={() => handleOpenDetails(file)}
  >
    <FileCodeCorner aria-hidden />
  </IconButton>
))}
```

**✅ Good:** each button names the file it opens.

```tsx
{files.map((file) => (
  <IconButton
    aria-label={`Open ${file.relativeFilePath} details`}
    key={file.relativeFilePath}
    onClick={() => handleOpenDetails(file)}
  >
    <FileCodeCorner aria-hidden />
  </IconButton>
))}
```

<a id="rule-56"></a>

### 56. Expose the state the user can change

- **State:** Selection, expansion, checked choice, disabled status, and busy
  status **MUST** use the semantics of the chosen control. Visual styling
  **MUST NOT** be their only signal.
- **Ownership:** MUI controls **SHOULD** supply their built-in semantics;
  custom controls **MUST** keep their ARIA state in sync with actual state.
  A menu choice **MAY** use `menuitemradio` with `aria-checked`.
- **Accuracy:** `aria-expanded` **MUST** describe the controlled popup or
  region, not an unrelated visual highlight.

See [WAI-ARIA's menu-button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)
and the [context-menu entry](packages/ui-unified/menus/context-menu/context-menu-entry.tsx).

**❌ Bad:** a checked menu choice is only colored differently.

```tsx
<MenuItem selected={isSelected}>
  Dark mode
</MenuItem>
```

**✅ Good:** the choice exposes its current state.

```tsx
<MenuItem
  aria-checked={isSelected}
  role="menuitemradio"
  selected={isSelected}
>
  Dark mode
</MenuItem>
```

<a id="rule-57"></a>

### 57. Remove inactive views from the focus path

- **Mounted views:** A view kept mounted to preserve graph or list state
  **MUST** leave both the accessibility tree and keyboard tab order while
  inactive.
- **Hiding:** `aria-hidden` alone **MUST NOT** be used on a container with
  focusable descendants. Use `hidden` or `inert` when layout need not be
  preserved. A mounted view whose geometry must remain measured **SHOULD** use
  `visibility: hidden` while inactive so descendants cannot receive focus and
  the layout box remains.
- **Return:** When the view becomes active, its controls **MUST** be reachable
  again without creating duplicate focus targets.

See the [accessible interactions ADR](adr/009-make-ui-interactions-accessible-and-testable.md)
and [W3C's ARIA-in-HTML guidance](https://www.w3.org/TR/html-aria/).

**❌ Bad:** the invisible tree still contains keyboard-reachable items.

```tsx
// aria-hidden does not remove descendants from the keyboard tab order.
<Box aria-hidden={!isListActive}>
  <GeneratedFilesList />
</Box>
```

**✅ Good:** keep the view mounted and measured while hiding its controls.

```tsx
<Box
  aria-hidden={!isListActive}
  className={playgroundGeneratedOutputViewClasses.view}
  data-inactive={!isListActive}
>
  <GeneratedFilesList />
</Box>
```

```tsx
// playground-generated-output-view.styles.tsx (excerpt)
// language=postcss
export const PlaygroundGeneratedOutputViewStyles = styled(Box)`
  & .${playgroundGeneratedOutputViewClasses.view}[data-inactive='true'] {
    visibility: hidden;
  }
`;
```

<a id="rule-58"></a>

### 58. Preserve keyboard paths and predictable focus

- **Equivalent action:** An action available by click or right-click
  **MUST** also have a keyboard path. A context menu **SHOULD** have a
  focusable trigger or support the platform's context-menu key.
- **Composite widgets:** Menus, trees, and graph interactions **SHOULD**
  follow their established keyboard patterns rather than inventing keys.
  Focus **MUST** move predictably when a popup opens and closes.
- **Editor:** Custom shortcuts **MUST NOT** break Monaco's expected editor
  navigation and editing keys.

See [WAI-ARIA's keyboard guidance](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
and [menu-button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/).

**❌ Bad:** the file's actions open only on pointer right-click.

```tsx
<Box onContextMenu={handleContextMenu}>
  {file.relativeFilePath}
</Box>
```

**✅ Good:** retain right-click and add a keyboard-operable button for the
same menu.

```tsx
import type { MouseEvent } from 'react';

const handleContextMenu = (event: MouseEvent<HTMLElement>): void => {
  event.preventDefault();
  setMenuPlacement({
    position: { left: event.clientX, top: event.clientY },
  });
};

const handleButtonClick = (event: MouseEvent<HTMLButtonElement>): void => {
  setMenuPlacement({ anchor: event.currentTarget });
};

<Box onContextMenu={handleContextMenu}>
  {file.relativeFilePath}
  <IconButton
    aria-expanded={isMenuOpen}
    aria-haspopup="menu"
    aria-label={`Actions for ${file.relativeFilePath}`}
    onClick={handleButtonClick}
  >
    <Ellipsis aria-hidden />
  </IconButton>
</Box>
```

<a id="rule-59"></a>

### 59. Keep focus visible and distinct from selection

- **Focus indicator:** A keyboard-focused control **MUST** remain visibly
  identifiable. Removing the browser outline **MUST** be paired with an
  equally clear replacement.
- **Different states:** Focus, explicit selection, and implicit graph
  selection **SHOULD** remain visually distinguishable. Color alone
  **SHOULD NOT** carry the distinction.

See [WAI-ARIA's focus guidance](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
and [graph-view styles](packages/graph-ui/src/lib/codegena-graph-view/codegena-graph-view.styles.tsx).

**❌ Bad:** the active graph node loses its keyboard focus indicator.

```tsx
// codegena-graph-view.styles.tsx (excerpt)
// language=postcss
export const CodegenaGraphViewStyles = styled(Paper)(() => `
  .${codegenaGraphViewClasses.canvas} .react-flow__node:focus-visible {
    outline: none;
  }
`);
```

**✅ Good:** the focused node has a theme-colored outline independent of
selection, inside its styled component's CSS template.

```tsx
// codegena-graph-view.styles.tsx (excerpt)
// language=postcss
export const CodegenaGraphViewStyles = styled(Paper)(({ theme }) => `
  .${codegenaGraphViewClasses.canvas} .react-flow__node:focus-visible {
    outline: 2px solid ${theme.palette.primary.main};
    outline-offset: 4px;
  }
`);
```

<a id="testing"></a>

## 🧪 Testing

<a id="rule-60"></a>

### 60. Test controls and results by role and name

- **Inspect:** Changed UI **SHOULD** be inspected in Storybook for its
  relevant role, name, focus order, and state.
- **Browser test:** E2E checks **MUST** locate user-facing controls by role
  and name, then assert state where applicable. A structural selector
  **MAY** target an internal detail with no semantic equivalent.
- **Read-only results:** A test for a named count or status **MUST** locate
  it by role and accessible name. It **MUST NOT** use MUI or icon classes to
  identify that result. A behavior test **SHOULD** assert the information,
  not a decorative icon.
- **Keyboard regression:** A changed interaction with a custom focus path
  **SHOULD** have a keyboard assertion as well as a pointer assertion.

Give repeated controls [distinct accessible names](#rule-55) so these checks
can identify the intended action. See also the
[accessible interactions ADR](adr/009-make-ui-interactions-accessible-and-testable.md)
and [Playground E2E cases](apps/playground-ui-e2e/e2e/).

**❌ Bad:** locate a public action by a private CSS class.

```ts
await page.locator('.GeneratedFilesList__action').click();
```

**✅ Good:** find and operate the action as a user can.

```ts
const actions = page.getByRole('button', {
  name: 'Actions for example.ts',
});

await actions.focus();
await page.keyboard.press('Enter');
await expect(page.getByRole('menu')).toBeVisible();
```

**❌ Bad:** this count test depends on MUI and Lucide class names, and checks
an icon instead of the result.

```ts
const fileBadge = page.locator('.MuiChip-root').filter({
  hasText: '2 files',
});

await expect(fileBadge.locator('svg.lucide-files')).toBeVisible();
```

**✅ Good:** the count has a useful accessible name, and the test checks that
same information without depending on its visual implementation.

```tsx
// generated-output-list-counts.tsx
// fileCount is a numeric prop of GeneratedOutputListCounts.
const fileNoun = fileCount === 1 ? 'file' : 'files';

<Chip
  aria-label={`Generated output: ${fileCount} ${fileNoun} total`}
  icon={<Files aria-hidden />}
  label={`${fileCount} ${fileNoun}`}
  role="status"
/>;
```

```ts
// generated-views.spec.ts
const fileBadge = page.getByRole('status', {
  name: 'Generated output: 2 files total',
});

await expect(fileBadge).toBeVisible();
await expect(fileBadge).toHaveText('2 files');
```

<a id="rule-61"></a>

### 61. Start from a concrete case and local test assets

- **Case:** A new feature **MUST** begin with a focused test that demonstrates
  its behavior and fails before implementation. Related specs **SHOULD** be
  read for existing assertions and names.
- **Layer:** Small features and edge cases **MUST** have focused Jest coverage.
  UI-visible behavior **MUST** also have a Playwright path in its related E2E
  project; see [rule 65](#rule-65).
- **Assets:** Fixtures, mocks, and rendering helpers **MUST** come from the
  owning Nx project. A test **SHOULD NOT** copy an existing loader or borrow
  another project's fixture.
- **New fixture:** It **MAY** be added when the local set cannot express the
  case. It **SHOULD** match nearby formatting and model realistic input.
- **UI use case first:** Before implementing each UI use case, its owning
  project **MUST** have a named Storybook story that makes the case's starting
  state and action reachable. An existing story **MAY** be reused when it
  already represents the case. Stories **MUST NOT** replace behavior tests.
- **Scenario coverage:** A stateful reusable view **SHOULD** have named stories
  for its meaningfully different states, such as loading, ready, pending, and
  failed. Stories **MUST** use deterministic fixtures from the owning project;
  they **SHOULD NOT** enumerate every possible prop combination.

**❌ Bad:** repeat custom loading and invent a minimal fixture beside the spec.

```ts
const schema = JSON.parse(readFileSync('./array-prefix-and-items.jsonc', 'utf8'));
expect(await render(schema)).toContain('type Result');
```

**✅ Good:** reuse the project's renderer and assert the complete behavior.

```ts
const rendered = await renderSchemaByFileName('array-prefix-and-items.jsonc');
expect(rendered).toBe(expectedTypeScript);
```

**❌ Bad:** a changing fixture and a generic story leave the retry use case
without a reproducible starting state.

```tsx
export const Default: StoryObj<typeof JobPanel> = {
  args: {
    job: createJobFixture({ id: crypto.randomUUID() }),
    onRetry: () => undefined,
    status: 'failed',
  },
};
```

**✅ Good:** add named, repeatable scenarios before implementing the retry
interaction. A separate behavior test verifies that interaction.

```tsx
import type { StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

const job = createJobFixture({ id: 'job-1' });

export const Loading: StoryObj<typeof JobPanel> = {
  args: { status: 'loading' },
};

export const Ready: StoryObj<typeof JobPanel> = {
  args: { job, status: 'ready' },
};

export const RetryAfterFailure: StoryObj<typeof JobPanel> = {
  args: {
    job,
    onRetry: fn(),
    status: 'failed',
  },
};
```

See the [OAS3 Visitor TypeScript visitor fixtures](packages/oas3-visitor-typescript/src/visitors/__fixtures__/)
and [visitor specifications](packages/oas3-visitor-typescript/src/visitors/).
The [control panel stories](https://github.com/koshevy/bot-store/blob/main/libs/bot-subscription-seller-ui/src/lib/control-panel/control-panel.stories.tsx)
show named lifecycle scenarios with local fixtures.

<a id="rule-62"></a>

### 62. Reuse the shared Storybook preview

- **Shared setup:** A UI library's Storybook preview **MUST** use
  `@codegena/ui-theme/storybook` for its theme, CSS baseline, and page styles.
  It **MUST NOT** copy that setup into a local decorator or individual stories.
- **Local setup:** Feature-specific providers **MAY** be added in the local
  preview. Keep the shared theme decorator outside them so portals inherit
  the theme.
- **Dark stories:** Set `parameters: { codegenaTheme: 'dark' }` on the story.
  A story **MUST NOT** add another `ThemeProvider` just to change the mode.

**❌ Bad:** each library rebuilds the same theme and page decorator.

```tsx
// .storybook/preview.tsx
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import { CodegenaLightTheme } from '@codegena/ui-theme';

export default {
  decorators: [
    (Story) => (
      <ThemeProvider theme={CodegenaLightTheme}>
        <CssBaseline />
        <GlobalStyles styles={{ body: { margin: 0 } }} />
        <Story />
      </ThemeProvider>
    ),
  ],
};
```

**✅ Good:** use the shared preview as the library default.

```ts
// .storybook/preview.ts
export { codegenaStorybookPreview as default } from '@codegena/ui-theme/storybook';
```

See the [Graph Search preview](packages/graph-search-ui/.storybook/preview.ts)
and the [Playground preview](packages/playground-ui/.storybook/preview.ts),
which adds its own notification provider.

<a id="rule-63"></a>

### 63. Put focused tests beside their owner

An isolated module's focused test **MUST** live beside it as
`<module>.spec.ts`. Cases **SHOULD** name observable behavior. Tests **SHOULD**
reuse nearby utilities and fixtures owned by the same Nx project.

**❌ Bad:** a helper spec asserts an unrelated whole-engine outcome.

```ts
// sort-graph-payload-nodes-by.spec.ts
it('works', async () => {
  expect((await generateEverything()).length).toBeGreaterThan(0);
});
```

**✅ Good:** the helper spec checks its own contract.

```ts
// sort-graph-payload-nodes-by.spec.ts
it('sorts files by source location', () => {
  expect(sortGraphPayloadNodesBy(nodes, 'source')).toEqual(expected);
});
```

<a id="rule-64"></a>

### 64. Give cross-feature smoke tests their own owner

- **Owner:** A full-engine test **MUST** sit beside its owning abstraction as
  `<owner>.<concern>.spec.ts`, not beside one incidental helper.
- **Snapshot:** It **MUST** live in `__snapshots__` beside that spec and
  use the owning spec's basename. It **SHOULD** cover only a scope a human
  can review.
- **Catalog:** The [OAS3 Visitor TypeScript use-case table](packages/oas3-visitor-typescript/USECASES.md) or
  [Playground E2E catalog](apps/playground-ui-e2e/TESTCASES.md) **MUST** reflect
  changed behavior.

See the [generator coverage ADR](packages/oas3-visitor-typescript/adr/005-audit-generation-with-topology-based-use-cases.md)
and [Storybook/Playwright ADR](adr/008-test-composed-ui-through-storybook-and-playwright.md).

**❌ Bad:** store a whole-engine file-structure test under one helper's name.

```text
plan-oas-file-paths.spec.ts → snapshot of the whole-engine file-path listing
```

**✅ Good:** the spec name and snapshot scope describe the owning output.

```ts
// typescript-parser-visitor.file-structure.spec.ts
it('preserves GitHub generated file structure', async () => {
  const groups = await jsonSchemaToTypescript({
    logger: createTestingLogger([]),
    mode: 'separateFiles',
    srcFilePath: githubFixturePath,
  });

  const listing = groups.map(({ fileName }) => fileName).toSorted().join('\n');

  expect(listing).toMatchSnapshot();
});
```

<a id="rule-65"></a>

### 65. Follow affected E2E projects for UI behavior

- **Find the project:** The Nx graph **MUST** be checked for E2E projects
  related by imports or `implicitDependencies`, including indirect consumers.
- **Cover new behavior:** New UI-visible functionality **MUST** have a
  Playwright case in the related E2E app. A core feature **MUST** also be
  reachable in its related UI and covered by that app.
- **Reproduce the bug:** A newly found and fixed UI bug **MUST** have a
  focused Playwright test that fails before the fix. If no related E2E
  project exists, one **MUST** be established for that UI behavior.
- **Supply state:** The E2E test **SHOULD** reuse the story required by
  [rule 61](#rule-61). If no existing story exposes the use case's starting
  state and action, add or extend one before implementation. A story alone
  **MUST NOT** count as a behavior test.
- **Track coverage:** The related case catalog **MUST** be updated.

**❌ Bad:** fix a selection bug and leave only a visual story.

```text
packages/playground-ui/playground/playground.stories.tsx
  ComprehensiveWithPersistence story exists; no browser assertion covers the bug.
```

**✅ Good:** reproduce the user path in the related E2E owner.

```ts
// apps/playground-ui-e2e/e2e/json-schema/generated-views.spec.ts
test('keeps a selected file visible after list scrolling', async ({ page }) => {
  await page.goto(
    '/iframe.html?id=codegena-playground--comprehensive-with-persistence&viewMode=story',
  );
  await page.getByRole('button', { name: 'List', exact: true }).click();

  const fileList = page.locator('.GeneratedFilesList__root');
  const tree = page.getByRole('tree', { name: 'Generated files' });
  const firstFile = tree.getByRole('treeitem', { name: /first-level\.ts/ });
  const laterFile = tree.getByRole('treeitem', {
    name: /simple-object-with-properties\.ts/,
  });

  await firstFile.click();

  await fileList.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

  await laterFile.click();
  await expect(laterFile).toHaveAttribute('aria-checked', 'true');
  await expect(laterFile.locator(':scope > .MuiTreeItem-content')).toBeInViewport();
});
```

The [Playground case catalog](apps/playground-ui-e2e/TESTCASES.md) tracks
implemented and missing cases.

<a id="rule-66"></a>

### 66. Type-check tests and compare meaningful output

- **Type safety:** Tests **MUST** type-check under their specification
  `tsconfig`; Jest transpilation or a build excluding specs **MUST NOT** stand
  in for that check. Test-value narrowing follows rule 29.
- **Output:** Complete generated output **SHOULD** be compared when its whole
  form is the contract. For repeatability, the first result **SHOULD** match
  the expected output and later results **SHOULD** match the first.

**❌ Bad:** partial assertions can miss broken output and differences between
runs.

```ts
const first = await renderSchema();
const second = await renderSchema();

expect(first).toContain('type Position =');
expect(second).toContain('type Position =');
```

**✅ Good:** compare the complete result and check repeatability.

```ts
const first = await renderSchema();
const second = await renderSchema();

expect(first).toBe(expected);
expect(second).toBe(first);
```

<a id="refactoring"></a>

## 🔧 Design and refactoring

<a id="rule-67"></a>

### 67. [🤖 AI only] Learn the owner before changing behavior

Before editing an Nx project:

1. **Locate the boundary.** Relevant repository and project ADRs **MUST** be
   read before investigating code or tests. The resolved Nx configuration
   **MUST** be checked before implementation.
2. **Compare nearby code.** The closest implementation with the same purpose
   **SHOULD** establish names, decomposition, strict types, and local idioms.
   When a project is too small, OAS3 Core and OAS3 Visitor TypeScript **MAY** provide the reference.
3. **Read the proof.** Related specs, fixtures, mocks, and the applicable
   ESLint config **MUST** be inspected before changing behavior. The affected
   E2E project **MUST** be found through the Nx graph when UI is involved.
4. **Audit extracted React parts.** When splitting a component, inspect each
   child's imports for parent-private or sibling-private files. Review changed
   JSX for multi-element mapped rows, inline compound conditions, assembled
   class strings, and multi-part accessibility labels against the React and
   accessibility rules above.

**❌ Bad:** infer a visitor's contract from one matching string and add a new
fixture loader without reading its existing tests.

```text
Search result → edit visitor → run one test
```

**✅ Good:** inspect the owner and its existing proof before implementation.

```bash
npm exec -- nx show project @codegena/oas3-visitor-typescript --json
rg -n 'visitorSomeOf' packages/oas3-visitor-typescript/src/visitors
rg --files packages/oas3-visitor-typescript/src/visitors | rg '(__fixtures__|testing-utils|spec\.ts)'
```

<a id="rule-68"></a>

### 68. Use adopted APIs before writing infrastructure

Before a nontrivial transformation:

1. **Define the work.** Its owner, inputs, output, expected collection size,
   and time cost **MUST** be identified.
2. **Check existing tools.** The language and adopted packages **MUST** be
   checked for a suitable API, including the installed version and local usage.
3. **Add only the missing behavior.** A custom solution **MAY** be written
   when those APIs cannot meet the requirement. A wrapper **SHOULD** expose
   less than the library it wraps.

For example, a virtualizer's `scrollToIndex` already addresses a virtual row;
another scroll engine would add ownership and timing problems without solving
a missing capability.

**❌ Bad:** manually scan mounted rows to reveal an item in an existing virtualizer.

```ts
// Rows outside the rendered range have no element to scroll into view.
rows.forEach((row) => {
  if (row.fileName === targetFileName) {
    row.element?.scrollIntoView();
  }
});
```

**👌 Acceptable:** use DOM scrolling for a short, non-virtual list.

```ts
targetElement?.scrollIntoView({ block: 'center' });
```

**✅ Good:** ask the owning virtualizer to reveal its indexed row.

```ts
const targetIndex = files.findIndex(({ fileName }) => (
  fileName === targetFileName
));

if (targetIndex < 0) {
  return;
}

virtualizer.scrollToIndex(targetIndex, { align: 'center' });
```

<a id="rule-69"></a>

### 69. Extract a helper only for a named responsibility

For shared logic, separate the decision into three checks:

1. **Meaning:** Duplicated behavior with one clear responsibility **SHOULD**
   become a named helper. Superficially similar flows **SHOULD NOT** become a
   generic engine for an uncertain future use.
2. **Owner:** Existing utility areas in the target Nx project **MUST** be
   inspected before adding another. The helper **SHOULD** live beside its
   owner or in the nearest relevant `utils` area; a shorter import path alone
   **MUST NOT** justify a duplicate directory.
3. **Public path:** A public helper in an encapsulating directory **MUST** be
   exported through its `index.ts`. Before moving it, imports, barrels, aliases,
   and build entrypoints **MUST** be checked for stale paths.

**❌ Bad:** repeat an important identity rule in several callers.

```ts
function visibleKey(message: NotificationMessage): string {
  return [message.title ?? 'no-title', message.fallbackMessage].join(':');
}

function groupedKey(message: NotificationMessage): string {
  return [message.title ?? 'no-title', message.fallbackMessage].join(':');
}
```

**✅ Good:** one focused helper owns the rule.

```ts
function createNotificationMessageKey(
  message: Pick<NotificationMessage, 'title' | 'fallbackMessage'>,
): string {
  return [message.title ?? 'no-title', message.fallbackMessage].join(':');
}
```

See the [notification key helper](packages/notification-ui-notistack/src/lib/create-notification-message-key.ts).

<a id="rule-70"></a>

### 70. Keep the requested operation and its types small

- **Scope:** An extraction **MUST** stay within the requested operation; it
  **MUST NOT** move the owner's unrelated work.
- **Type:** A new interface **SHOULD** express a stable boundary or invariant
  that existing domain types cannot convey. Local intermediates **SHOULD** be
  inferred.
- **Final review:** Every new loop, nested scan, state field, request token,
  helper, and interface **MUST** have a clear owner, purpose, and cost. Passing
  tests alone does not answer this review.

**❌ Bad:** extracting a sort operation also moves the entire tree hook and
adds a one-use result interface.

```ts
interface SortedTreeResult {
  nodes: GraphPayloadNode[];
}

function createGeneratedFilesTreeAndSort(...): SortedTreeResult;
```

**✅ Good:** the pure operation accepts domain data and leaves the hook's
other responsibilities with their owner.

```ts
function sortGraphPayloadNodesBy(
  nodes: GraphPayloadNode[],
  sortType: 'filename' | 'source',
): GraphPayloadNode[];
```

See [the sorting helper](packages/playground-ui/graph-utils/sort-graph-payload-nodes-by.ts)
and [its owning hook](packages/playground-ui/generated-files-list/use-generated-files-tree.ts).

<a id="verification-and-sources"></a>

## ✅ Verification and sources

<a id="rule-71"></a>

### 71. Record significant architecture changes at their owner

- **Existing decision:** A changed shared contract, dependency, data flow,
  or ownership pattern **MUST** be checked against related ADRs. A changed
  decision **MUST** be updated or superseded.
- **New decision:** A significant project decision **SHOULD** live under
  `packages/<project>/adr/` or `apps/<project>/adr/`; a workspace decision
  **SHOULD** live in root [`adr/`](adr/).
- **Routine edit:** Formatting **MUST NOT** create an ADR.

Follow the [ADR conventions](.agents/skills/adr-skill/SKILL.md).

**❌ Bad:** change a shared UI dependency rule only in one package README.

```text
packages/playground-ui/README.md  (workspace-wide policy hidden here)
```

**✅ Good:** document a cross-project rule once and align the affected package
manifests with it.

```text
./
├── adr/
│   └── 005-standardize-react-ui-toolkit.md
└── packages/
    ├── playground-ui/
    │   └── package.json
    └── graph-ui/
        └── package.json
```

<a id="rule-72"></a>

### 72. [🤖 AI only] Inspect the active ESLint policy before editing

- **Before editing:** For an affected project, an AI assistant **MUST** read
  the root and project ESLint configurations and inspect relevant shared rules.
- **After editing:** It **MUST** use the project's resolved Nx lint target.
- **Authority:** The active ESLint configuration defines mechanical rules;
  this guide explains the code shape. The [linting overview](#concept-typescript)
  distinguishes TypeScript, React, and formatting scopes.

**❌ Bad:** read only the root config and assume it describes all rules for
Playground UI.

```bash
cat eslint.config.mjs
# Edit packages/playground-ui based on this file alone.
```

**✅ Good:** inspect the same project's complete config and relevant shared
rules before editing; run its Nx target afterward.

```bash
cat eslint.config.mjs
cat packages/playground-ui/eslint.config.mjs
rg -n 'banTransitiveDependencies|depConstraints' \
  packages/infr-nx/eslint-config/large-rules
npm exec -- nx show project @codegena/playground-ui --json
npm exec -- nx lint @codegena/playground-ui
```

<a id="rule-73"></a>

### 73. Keep diagnostics visible and fix their cause

- **No suppression:** New code and tests **MUST NOT** add `@ts-ignore`,
  `@ts-nocheck`, `@ts-expect-error`, or formatting-ignore comments merely to
  pass checks. Existing suppressions are not examples.
- **Fix the cause:** An error in the type, code, or fixture **MUST** be
  corrected. Shared rule severity **MUST NOT** be lowered merely to make lint
  pass; a deliberate change **MUST** have a documented reason.
- **Review warnings:** A passing Nx lint target can still report warnings.
  Contributors **MUST** read them and **SHOULD** fix actionable warnings in
  changed code when practical. An intentional unresolved warning **MUST**
  remain visible and have its reason recorded; it **MUST NOT** be ignored
  merely because lint exits successfully.
- **Unknown input:** It **SHOULD** use `unknown` and narrowing, not `any` or
  a cast that only silences the compiler.

**❌ Bad:** suppress the error at its use site.

```ts
// @ts-ignore
const name = input.operationId.toUpperCase();
```

**✅ Good:** narrow before using the value.

```ts
if (typeof input.operationId !== 'string') {
  return null;
}

const name = input.operationId.toUpperCase();
```

<a id="rule-74"></a>

### 74. Require approval for exceptional `eslint-disable` use

- **Default:** An ESLint failure **MUST** be fixed in the code unless the
  exception below is approved. A directive **MUST NOT** be added for
  convenience, used to silence unrelated rules, or treated as justified
  because a nearby directive already exists.
- **Possible exceptions:** A narrowly scoped directive **MAY** be proposed
  when satisfying the rule would materially harm clarity or correctness. For
  example:
  - An indivisible line exceeds `max-len` and cannot be shortened without
    changing the value it represents.
  - A cohesive file of recursive types exceeds `max-lines`, but splitting it
    would obscure or break those relationships.
  - A descriptive test title exceeds `max-len`, and shortening or splitting it
    would make the tested behavior harder to understand.
  - An unlisted case has a similarly concrete reason. This list does not
    preapprove any directive.
- **Approval:** Before adding a directive, an AI assistant **MUST** obtain
  explicit approval from a human for its rule, location, and reason. A human
  contributor **MUST** obtain approval from the responsible maintainer. The
  approver **MAY** decline without giving a reason.
- **Scope:** An approved directive **MUST** name only the affected rule and
  cover the smallest practical span. Its comment **MUST** state why the code
  cannot reasonably satisfy the rule. Approval for one directive **MUST NOT**
  be reused for another.

**❌ Bad:** disable every rule for an entire file to preserve one long value.

```ts
/* eslint-disable */
const schemaId = 'https://schemas.example.org/a/long/external/identifier/that/is/defined/by/the/source/specification';
```

**✅ Good:** after approval, name the exact rule and explain the exception at
the affected line.

```ts
/* eslint-disable-next-line max-len -- approved: exact schema ID must stay intact */
const schemaId = 'https://schemas.example.org/a/long/external/identifier/that/is/defined/by/the/source/specification';
```

<a id="sources-and-precedence"></a>

### Sources and precedence

- **Mechanical rules:** [ESLint](eslint.config.mjs), shared
  [Codegena NX Plugin rule sets](packages/infr-nx/eslint-config/), TypeScript
  configuration, and [`.editorconfig`](.editorconfig) govern indentation,
  quotes, import order, and line limits. These rules **MUST** be followed;
  the only source-level ESLint exception is the approved, scoped directive
  described in [rule 74](#rule-74).
- **Architecture:** Contributors **SHOULD** consult the
  [repository ADR index](adr/README.md), then the affected package's ADR
  index. The [schema interpretation boundary](adr/001-use-transitive-nodes-as-schema-boundary.md)
  is one such decision. ADRs explain why a boundary exists; the nearest maintained
  implementation shows its current shape.
- **[🤖 AI only] Workflows:** Code changes **MUST** follow
  [`relevant-changes`](.agents/skills/relevant-changes/SKILL.md), including
  its design and diff-review gates. React changes **MUST** also follow the
  [React](#react-rules) and [accessibility](#accessibility) rules above.

<a id="frequent-regressions"></a>

### Check for frequent regressions

- **🔁 Controlled-state reaction loops:** Trace a change from the parent to
  each child, through its `onChange` or subscription, and back to the parent.
  Verify that an equal value stops there, a user edit produces one outward
  update, and an intentional external reset reinitializes the child once.
  See the [state ownership](#rule-41) and [echo guard](#rule-45) rules.
- **🧭 Conflicting user paths:** List the hooks that react to the same
  selection, form value, or reveal action. Check their combined order at the
  common owner: a local fix in one hook can trigger another hook to undo it.
  For example, trace selection → details reveal → graph focus → selection.
  Verify both the direct path and the path through a sibling view, including
  repeated actions and remounts. Do not use [deferred work](#rule-46) to mask
  a feedback loop.
- **🧪 Reproduce the full path:** A focused test **SHOULD** check the pure
  comparator or transformation. A composed UI regression **MUST** also have a
  human-repeatable browser path and an E2E check for the visible result; see
  [browser testing](#rule-65).

<a id="before-finishing"></a>

### Before finishing

1. **Review the diff for design as well as syntax.** Each new state field,
   helper, interface, loop, and repeated collection scan **MUST** have a clear
   owner, purpose, and cost. Unclear additions **MUST** be simplified or
   removed.
2. **Run the affected Nx targets.** Relevant tests, lint, build, and
   typecheck **MUST** be run. Related E2E projects **MUST** be checked for
   composed UI changes. Relevant `tsconfig` files **MUST** retain strict,
   type-safe options. The [contributing guide](CONTRIBUTING.md) shows the
   commands. A passing test suite **MUST NOT** substitute for the design
   review.
3. **Check dependency security.** After a feature, run the
   [required SCA command](#rule-11). Resolve findings through patched releases
   or the [time-limited exception policy](#rule-13); review newly added
   dependencies even when an existing exception makes the audit pass.
4. **Update the right record.** New behavior **MUST** appear in adjacent tests
   and the applicable case catalog. A significant contract or architectural
   change **SHOULD** update or create an [ADR](adr/README.md). Ordinary
   formatting does not require one.
