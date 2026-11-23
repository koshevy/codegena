---
status: proposed
date: 2026-10-13
decision-makers: Codegena project maintainers
---

# Use themed Monaco editors for source and generated code

## Why

The source editor needs editable JSON, line navigation, and declaration/warning markers. An external icon strip once drifted from Monaco line numbers. Generated files need read-only TypeScript without repainting the source editor when virtualized editors mount.

## Decision

> [!IMPORTANT]
> **Use Monaco's own editor and glyph APIs, with colors from `ui-theme` and separate mounting paths for source and generated code.**

- **✍️ Two editor paths:** [`@monaco-editor/react`](../../ui-unified/code-editor/code-editor.tsx) hosts editable source.
  - [Generated code](../../ui-unified/code-editor/generated-code-editor.tsx) uses Monaco's direct API in read-only mode.
  - Mounting a generated editor **MUST NOT** invoke a global theme change that recolors source syntax.
- **🎨 Stable theme:** [Theme creation](../../ui-unified/code-editor/create-monaco-theme.ts) maps actual MUI token values, not theme-object identity.
  - Theme registration **MUST** change only when those values change.
  - Light, Dark, and System are controlled by Playground; System follows later OS preference changes.
  - Playground starts in System mode unless its host supplies an initial appearance; saved preferences take precedence. The Light and Dark stories set that choice explicitly.
  - Source JSON and generated TypeScript use the same theme-colored pending text while Monaco initializes syntax. Source JSON stays pending until its colored tokens appear, then blends into the code colors; scrolling an initialized editor does not restart that state.
- **⚙️ Worker bootstrap:** The [`monaco-workers` entrypoint](../../ui-unified/monaco-workers/) configures local JSON and editor workers before Vite hosts mount an editor. Generated TypeScript uses Monaco's syntax tokenizer.
  - Monaco keeps JSON syntax errors, but suppresses schema validation and schema requests. Codegena provides source warnings through its own markers, avoiding unrelated meta-schema diagnostics.
- **📍 Native gutter:** Monaco's compact line numbers and glyph margin host source and generated declaration markers. A generated marker uses the declaration's line in its output file and opens its source location directly; when several declarations share a generated line, the first owns that marker. JetBrains Mono and shared [scrollbar tokens](../../ui-unified/scrolling/scrollbar-theme.ts) align editor typography and square handles with the rest of the UI; Monaco retains its own track and scrolling.
- **🔎 Warning hover:** Codegena's marker hover uses the theme's body font and soft shadow while source code keeps JetBrains Mono. Its width fits the editor column. Monaco has no per-marker option to remove its problem/quick-fix footer, so the JSON editor scopes a small CSS override to Codegena warning links.
- **⌨️ Bounded controls:** The editable JSON source keeps folding, Go to Symbol, and its Copy/Paste menu. Generated TypeScript keeps syntax coloring, folding, and Copy, but disables language-service diagnostics, navigation, completions, and hint UI. Mounting output editors must not rebuild source syntax.
- **🔗 Local references:** F12 on a source `$ref` resolves JSON Pointers and named anchors within the current JSONC model. Parse the model on demand and cache by version; external references need a source-model registry and remain outside this editor's navigation scope.
- **🧩 Input contract:** Source starts with an empty Monaco model, then receives `sourceSchemaText` on mount. This preserves tokenization for specifications above Monaco's model-creation line limit. Later prop changes do not automatically replace editor text. In Show all, a selection change **SHOULD** keep the visible-files result stable to avoid remounting output editors.

This decision does not sync edits back to the parser or introduce another syntax highlighter.

## Trade-offs

- **✅ Good:** Markers stay aligned with Monaco; source and generated output share theme tokens without remount flicker.
- **⚠️ Cost:** Monaco theme keys and separate editor modes need maintenance. Generated files no longer offer type diagnostics or symbol navigation inside Monaco.

## Alternatives

- **Plain text viewer:** Smaller but loses navigation, folding, and native glyphs.
- **External icon strip:** Caused line-height and scrolling mismatch.
- **Leave TypeScript services enabled:** Adds hover popups and language-service work to read-only generated output.

## Verification

- [ ] Source is editable; generated files are read-only; glyphs align during scroll and folding.
- [ ] Generated TypeScript has syntax colors and folding without type hovers, diagnostics, or editing aids; its context menu offers Copy only.
- [ ] Light/dark [stories](../../ui-unified/code-editor/) use theme-derived colors and JetBrains Mono; mounting generated editors leaves source syntax stable.
- [ ] Menu actions and scrollbars match this contract; related Playground Nx and browser checks pass.

The [shared UI toolkit decision](../../../adr/005-standardize-react-ui-toolkit.md) governs the editor stack and theme tokens.
