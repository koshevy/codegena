# Unified UI

`@codegena/ui-unified` is Codegena's reusable React UI kit. It provides
presentation controls and editor infrastructure without graph or Playground
data types. Feature packages keep their own selection, navigation, diagnostics,
and other domain behavior.

## Choose an entrypoint

Import the smallest part that owns the control you need. The package publishes
these secondary entrypoints:

| Entrypoint | What it provides |
| --- | --- |
| `@codegena/ui-unified/panels` | Headers, toolbars, toggles, bodies, floating buttons, and header icon buttons |
| `@codegena/ui-unified/menus` | Context menus, theme-mode choices, and a keyboard-accessible theme menu button |
| `@codegena/ui-unified/icons` | Declaration, language, folder, warning, and GitHub icons |
| `@codegena/ui-unified/branding` | Codegena logo, animated wordmark, contact details, site footer, GitHub link, and shared page-header styles |
| `@codegena/ui-unified/feedback` | Severity cards and labels, plus show/hide controls |
| `@codegena/ui-unified/files` | File and directory detail headers |
| `@codegena/ui-unified/counts` | Compact nested-item counts |
| `@codegena/ui-unified/scrolling` | Themed scroll areas, scrollbar colors, and reveal highlights |
| `@codegena/ui-unified/code-editor` | Editable and read-only editors with a configurable `mode` |
| `@codegena/ui-unified/code-editor-minimal` | Highlighted code and native text input for apps that use only minimal mode |
| `@codegena/ui-unified/monaco-bootstrap` | Local Monaco initialization for application bootstrap or lazy routes |
| `@codegena/ui-unified/monaco-webpack` | Build-only options for local JSON and editor workers and selected editor features |
| `@codegena/ui-unified/monaco-vite` | Build-only Vite config that imports local worker factories |
| `@codegena/ui-unified/monaco-environment` | JSON and editor worker factories used by the Vite binding |
| `@codegena/ui-unified/monaco-workers` | Runtime bootstrap for Vite's local Monaco instance |

The root import also exports the controls. Prefer a secondary entrypoint so an
application can load only the part it uses. Vite 8 applications and Storybook
merge `createMonacoViteConfig()` from `monaco-vite` into their Vite config, then
import `monaco-workers` once before mounting an editor. The build binding
imports worker factories without assigning `globalThis.MonacoEnvironment`.
It excludes Monaco from dependency prebundling so that binding also applies
during development. Webpack and Rspack hosts
use `monaco-webpack` in their build configuration and call `initializeMonaco`
from `monaco-bootstrap` before mounting the first editor. The build-only
entrypoint is separate from the runtime root export.
The Monaco editor uses its syntax tokenizer for generated TypeScript.

`CodeEditor` and `GeneratedCodeEditor` default to `mode="full"` for Monaco
actions, lifecycle callbacks, and glyphs. Set `mode="minimal"` for native
editing or read-only code highlighted by TanStack Highlight. Both modes use the
same theme colors and typography. Switching modes mounts a new editor.

Import the same component names from `@codegena/ui-unified/code-editor-minimal`
when a page always uses minimal mode. This entrypoint renders synchronously
on the server and never imports Monaco or its workers.

The UI kit has no runtime dependency on another Codegena UI library. A feature
such as Playground owns notification-aware clipboard behavior above this layer.

```tsx
import { PanelHeader, PanelToggle } from '@codegena/ui-unified/panels';
import { FileCode } from 'lucide-react';
import { useState } from 'react';

export function SourceHeader() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <PanelHeader
      actions={(
        <PanelToggle
          isOpen={isOpen}
          isVisible
          onToggle={() => setIsOpen((open) => !open)}
          position="left"
          title="source schema"
        />
      )}
      icon={<FileCode aria-hidden size={18} />}
      title="Source schema"
    />
  );
}
```

For a smaller control, see the [panel toggle stories](panels/panel-toggle/panel-toggle.stories.tsx).
The [declaration icon stories](icons/declaration-type-icon/declaration-type-icon.stories.tsx)
show every icon kind, non-button presentation, disabled state, and dark mode.
The [editor glyph stories](code-editor/code-editor-glyph.stories.tsx)
place that same clickable icon beside line 2 in editable and generated editors.
Playground keeps [`WarningDetailed`](../playground-ui/misc-ui/warning-detailed/)
and its source-aware behavior in its own stories.

## Explore and verify

**Explore the controls**

- Start Storybook: `npm exec -- nx run @codegena/ui-unified:storybook`.
- Find stories beside each component. The sidebar groups them by entrypoint.

**Run checks**

- Lint: `npm exec -- nx run @codegena/ui-unified:lint`.
- Build: `npm exec -- nx run @codegena/ui-unified:build`.
- Browser tests: `npm exec -- nx run ui-unified-e2e:e2e`.

The [UI kit test cases](../../apps/ui-unified-e2e/TESTCASES.md) cover shared
controls. Playground's E2E project covers them inside cross-panel workflows.

**Understand the boundary**

- [Local ADR](adr/README.md): why these controls and entrypoints belong here.
- [Repository UI toolkit ADR](../../adr/005-standardize-react-ui-toolkit.md):
  shared styling and dependency conventions.
