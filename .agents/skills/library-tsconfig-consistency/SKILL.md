---
name: library-tsconfig-consistency
description: Align TypeScript project references, source sets, and compiler options when creating or changing a Codegena library's tsconfig files. Use for TypeScript resolution, build, test, or Storybook configuration problems.
---

# Library TypeScript Configuration

Use this skill for `packages/<library>/tsconfig*.json`. Read the repository's
[code style guide](../../../CODE_STYLE.md) and the target project's resolved
Nx configuration before editing. Preserve the project's actual build, test,
and Storybook responsibilities; do not copy another library's config wholesale.

## Choose the closest local reference

- [playground-ui](../../../packages/playground-ui/tsconfig.json): React UI
  library with `tsconfig.lib.json` and `tsconfig.storybook.json`. It has no
  `tsconfig.spec.json` because it has no local unit-test source set.
- [oas3-core](../../../packages/oas3-core/tsconfig.json) and
  [oas3-visitor-typescript](../../../packages/oas3-visitor-typescript/tsconfig.json): non-UI libraries with
  `tsconfig.lib.json` and `tsconfig.spec.json`, but no Storybook config.
- [Codegena NX Plugin](../../../packages/infr-nx/tsconfig.json): low-level
  TypeScript and JavaScript workspace tooling with library and spec configs.
  Its tooling role does not require React or Storybook options.

The project's [Nx tag](../../../CODE_STYLE.md#rule-16)
helps identify its role; actual source files and targets determine which
TypeScript projects it needs.

## Align the project graph

1. Inspect `npm exec -- nx show project <project-name> --json`, the project's
   `tsconfig*.json`, source files, test files, Storybook setup, and inherited
   [root options](../../../tsconfig.base.json). Identify the source set for
   each existing build, typecheck, test, and Storybook target.
2. Keep `tsconfig.json` as the project-reference entrypoint: extend
   `../../tsconfig.base.json`, use empty `files` and `include`, and reference
   `tsconfig.lib.json` plus each source set actually present. Add
   `tsconfig.spec.json` for local tests and `tsconfig.storybook.json` for local
   stories/Storybook configuration. Do not add either solely because of a tag.
3. Make `tsconfig.lib.json` extend `./tsconfig.json` and include production
   sources. Exclude specs, tests, stories, mocks, fixtures, and test-runner
   configuration from the production build. Match globs to the real tree;
   account for `.ts`, `.tsx`, `.js`, or `.jsx` only where used.
4. If tests exist, give `tsconfig.spec.json` the test files, test-only
   declarations and runner types, and a reference to `tsconfig.lib.json` when
   tests consume the library. OAS3 Core, OAS3 Visitor TypeScript, and Codegena NX Plugin extend the
   root base config directly here; do not force the external skill's
   `./tsconfig.json` pattern over this local convention.
5. If Storybook exists, give `tsconfig.storybook.json` the stories and
   `.storybook` files it owns. Keep story sources out of `tsconfig.lib.json`.
   Add only the Storybook-specific types and module options needed by the
   target; use playground-ui as the reference for React stories.
6. Keep `paths` and `baseUrl` in the root config, not in package configs.
   Preserve inherited `strict` and other type-safety options. Override
   `types`, `jsx`, `allowJs`, `moduleResolution`, or output settings only when
   the source set needs a different value. In particular, do not copy React,
   Emotion, MDX, or Jest types into every library by default.
7. Review every reference and glob for files accidentally omitted or compiled
   twice. Keep related globs grouped and ordering stable; do not reorder an
   existing config solely to match another monorepo's alphabetization rule.
8. Do not add a TypeScript project reference for a package used only by build,
   lint, or other configuration files. If Nx infers that configuration import
   as a project dependency, set `nx.sync.ignoredDependencies` in the affected
   runtime tsconfig and verify with `npm exec -- nx sync:check`. Keep actual
   source-code dependencies as project references.

## Verify

Run the Nx targets that exist for the affected project: `typecheck`, `lint`,
`test`, `build`, and `build-storybook` where applicable. Check the resolved
target list before invoking them. A successful Jest run or production build
does not prove that test sources type-check; verify the spec configuration
when it changes. Fix the source-set or option mismatch rather than adding a
local path alias, weakening strictness, or suppressing a diagnostic.
