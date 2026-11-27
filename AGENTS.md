<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

## Project skills

Maintain project skills only in `.agents/skills/`. Claude's `.claude/skills/` entries are symlinks to those directories; add a symlink there when adding a skill. Cursor and OpenCode discover `.agents/skills/` directly, so do not create copies in their tool-specific directories.

For local GitHub Actions testing, use the [gh-act skill](.agents/skills/gh-act/SKILL.md).

For code changes, load `.agents/skills/relevant-changes/SKILL.md` and apply its design gate before editing and its diff review before finishing. For React changes, follow the React and accessibility rules in `CODE_STYLE.md`.

For library TypeScript project configuration changes, load `.agents/skills/library-tsconfig-consistency/SKILL.md`. Check the project's actual build, test, and Storybook source sets before changing references, globs, or compiler options.

Read `CODE_STYLE.md` for the repository's human-facing code conventions and `CONTRIBUTING.md` for the contribution workflow. The skills describe how to work; the style guide explains the code shape to preserve.
