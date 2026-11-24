---
name: relevant-changes
description: Research, implement, and verify focused changes in an existing Codegena Nx project using its local contracts, tests, fixtures, and affected projects.
---

# Relevant Changes

Read the repository [code style guide](../../../CODE_STYLE.md) before editing.
It is the single human-facing source for file layout, TypeScript, React,
accessibility, test shape, and refactoring rules. This skill describes the
**AI workflow** for applying those rules; do not restate or replace them here.

## Discover the owner

1. Identify the target Nx project and inspect its resolved configuration with
   `npm exec -- nx show project <project-name> --json`. Read the root
   [ADR index](../../../adr/README.md), the project's ADR index when present,
   and the decisions relevant to the change before investigating code.
2. Read the nearest implementation with the same responsibility, its tests,
   fixtures, mocks, and public entrypoints. When a small project lacks a
   comparable pattern, inspect [oas3-core](../../../packages/oas3-core/) and
   [oas3-visitor-typescript](../../../packages/oas3-visitor-typescript/)
   as references. Read the root and target-project ESLint configurations before
   editing.
3. For UI behavior, use the Nx dependency graph to find related E2E projects,
   including imports and `implicitDependencies` through intermediate projects.
   Inspect their specs, Storybook state, and case catalog. Do not infer an E2E
   relationship from project names alone.

## Apply the design gate

1. State the requested behavior and strongest observable case. For a
   nontrivial transformation or state flow, identify its owner, inputs,
   output, expected size, and cost. Check the language and adopted packages
   for a suitable API before designing new infrastructure. Apply the
   [design and refactoring rules](../../../CODE_STYLE.md#refactoring).
2. Keep the proposed change inside the requested responsibility. Choose the
   test that will prove it and the nearest usable fixture. For React work,
   map the component owner, children, and shared state against the
   [React](../../../CODE_STYLE.md#react-rules) and
   [accessibility](../../../CODE_STYLE.md#accessibility) rules before moving
   code. List each effect, subscription, and nontrivial callback in the touched
   component; move independent, nontrivial behavior to its owning hook or child.

## Implement and track coverage

1. Start from the concrete case and update only its owning implementation,
   tests, and local fixtures or mocks. Follow the guide's
   [testing rules](../../../CODE_STYLE.md#testing) for placement and
   assertions.
2. For OAS3 Visitor TypeScript output changes, follow
   [maintain-use-cases-table](../../../packages/oas3-visitor-typescript/SKILLS.md#maintain-use-cases-table)
   and update [USECASES.md](../../../packages/oas3-visitor-typescript/USECASES.md) with the
   focused test. For a fixed UI bug, add a reproducing test in the related
   E2E project and update its case catalog.

## Verify and review the diff

1. Inspect the target's resolved Nx targets and their commands, then run its
   relevant `test`, `lint`, and `build` targets through `npm exec -- nx`. Run a
   `typecheck` target only after checking which source sets and compiler mode
   it covers. Run the related E2E target when changed behavior is covered
   there. Run lint again after changing imports.
2. Confirm type checking covers both production and test sources for **every
   project being verified**. Jest's SWC transformer does not check test types,
   and library builds exclude specs. Check each Jest source set with the
   temporary-config procedure below before attributing any compiler error to
   spec code, regardless of whether an Nx typecheck target ran. An inferred
   `tsc --build --emitDeclarationOnly` target may report TS5069 or TS6306 for
   a spec config. These are build-mode configuration diagnostics, not errors
   in the spec source. Do not change a tracked tsconfig or Nx target merely
   to make an ad hoc spec check pass.
   Report a separate target failure as such, and fix actual test typing errors
   found by the temporary check. Never weaken strictness or suppress a
   diagnostic to claim success.
3. Review the diff against the guide's
   [design gate](../../../CODE_STYLE.md#refactoring): every added loop,
   repeated scan, state field, helper, interface, and moved file needs a clear
   owner, purpose, and cost. For React changes, also inspect extracted
   children's imports and changed JSX as directed by the guide. Compare the
   component with the pre-edit hook inventory; check that substantial effects
   and subscriptions did not remain in its implementation file. Check
   `git status --short` for untracked files and search old paths after moves;
   confirm barrels, aliases, and build entrypoints still resolve. Passing
   tests alone does not complete this review.
4. Resolve failures caused by the change. Report unrelated or blocked checks
   with their command and affected file rather than masking them.
5. Have a separate agent review the verified diff in **review-only mode**, with
   no edits. Give it the changed files and the behavior to preserve, but not
   the implementation rationale as proof. Ask it to report concrete findings
   with file locations on three questions:
   - Can any new code, intermediate value, state, or helper be removed without
     changing behavior or the required lint, build, test, and E2E results?
   - Can a person reproduce each new user-workflow UI test by following its
     actions in the actual interface? Flag synthetic events used instead of
     real interactions, mocks that bypass the behavior under test, or tests
     that only confirm an implementation detail. Controlled viewport or
     failure setup is valid when it checks an observable result.
   - Does any code create unnecessary sophistication, such as duplicate
     collections, repeated scans, relayed requests, timers, or a custom
     mechanism for an available API? For example, a virtual-editor test
     projects `visitedFiles.values()` into two arrays and two `Set`s before
     comparing sizes. Challenge what each uniqueness check proves and whether
     every intermediate collection is needed. `Map.values()` is an iterator,
     so `.length` is not a valid substitute; simplify only after preserving
     the intended assertion.
   Resolve substantiated findings and rerun affected checks. If no separate
   agent is available, perform the same review as an explicit second pass and
   say that it was not independent.

### Check Jest test types with a temporary config

1. Discover the Jest configs for the projects being verified with
   `rg --files packages apps -g 'tsconfig.spec.json'`. Check **each** relevant
   project; do not use one package as the default for the whole workspace.
2. For each config, create a fresh anonymous `tsconfig.json` **in the OS temp
   directory**. Set `extends` to the absolute path of that project's existing
   `tsconfig.spec.json`, `compilerOptions.noEmit` to `true`, and `references`
   to `[]`. If the source config uses `composite`, set it to `false` only in the
   temporary config. Set `typeRoots` to the workspace's `node_modules/@types`
   and `node_modules` directories because a config under the OS temp directory
   cannot discover package types such as `jest` and `vite/client` through its
   parent directories.
3. Run `npm exec -- tsc --project <temporary-config>` and treat any diagnostic
   as a failed check. Always remove the temporary directory afterward, even
   when `tsc` fails. Run Jest through the project's Nx test target separately.

The temporary config must be created anew for every check. Do not create or
modify any project file, repository script, or Nx target for this verification.

## Record significant decisions

After implementation, compare any new shared contract, dependency direction,
data flow, or ownership pattern with related ADRs. Update, create, or
supersede a record only when the decision is significant; routine fixes and
formatting need no ADR. Follow the local [ADR skill](../adr-skill/SKILL.md)
for ownership, numbering, and links.
