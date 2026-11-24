---
name: nx-plugins
description: Find and add Nx plugins. USE WHEN user wants to discover available plugins, install a new plugin, or add support for a specific framework or technology to the workspace.
---

## Finding and Installing new plugins

Use the workspace package manager when running Nx. This workspace uses npm.

- List plugins: `npm exec -- nx list`
- Add a plugin: `npm exec -- nx add <plugin>` (for example, `npm exec -- nx add @nx/react`).
