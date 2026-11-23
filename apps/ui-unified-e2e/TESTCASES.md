# Unified UI browser test cases

These cases exercise the shared controls in their own Storybook stories. The
Playground E2E project retains cross-panel workflows because those behaviors
belong to Playground. Add a case here before implementing a new shared-control
journey, then update its status after verification.

**Status:** ✅ Implemented · 🚧 Partial · 📝 Planned  
**Priority:** 🔴 P0 regression · 🟡 P1 main interaction · 🟢 P2 supporting state

## Menus

| ID | User-visible case | Status | Priority |
| --- | --- | --- | --- |
| MENU-01 | A positioned context menu opens with its heading, selectable action, and disabled item; selecting an action closes it. | ✅ Implemented | 🟡 P1 |
| MENU-02 | Open the theme menu by keyboard in System, Light, and Dark states; verify the selected choice and restored focus on Escape. | ✅ Implemented | 🟡 P1 |

## Panels and icons

| ID | User-visible case | Status | Priority |
| --- | --- | --- | --- |
| PANEL-01 | Left and right panel toggles expose distinct accessible names for open and closed states. | ✅ Implemented | 🟡 P1 |
| ICON-01 | Warning action keeps its accessible name and themed tooltip. | ✅ Implemented | 🟢 P2 |
| ICON-02 | Language glyphs show the selected language name in a themed tooltip. | 📝 Planned | 🟢 P2 |
| ICON-03 | Open folders retain a dark outline around their pale fill in both themes. | ✅ Implemented | 🟢 P2 |
| PANEL-02 | A file header presents the file or directory icon, name, and optional actions. | 📝 Planned | 🟢 P2 |
| PANEL-03 | A header can omit its visible title and icon while retaining a clear accessible name, summary, and actions. | ✅ Implemented | 🟡 P1 |

## Branding

- **BRAND-01 · Implemented · P1:** The shared site footer presents its
  navigation, policy links, contact details, and animated wordmark in both themes.

- **BRAND-02 · Implemented · P1:** The GitHub icon is a named repository link
  with a tooltip on keyboard focus.

## Feedback

| ID | User-visible case | Status | Priority |
| --- | --- | --- | --- |
| FEEDBACK-01 | A severity card shows its label and message separately from domain-specific warning details. | ✅ Implemented | 🟡 P1 |
| FEEDBACK-02 | The severity stripe uses the warning color in light and dark themes. | ✅ Implemented | 🔴 P0 |

## Code editors and scrolling

| ID | User-visible case | Status | Priority |
| --- | --- | --- | --- |
| EDITOR-01 | The editable JSON editor mounts with syntax highlighting, accepts text, and formats JSON using its local language worker. | ✅ Implemented | 🟡 P1 |
| EDITOR-02 | The generated code editor keeps its model when syntax becomes ready. | 📝 Planned | 🟡 P1 |
| EDITOR-03 | A line glyph is visible and clickable in editable and generated editors. The full editor opens in development without downloading the excluded inline-completion contribution. | ✅ Implemented | 🟡 P1 |
| EDITOR-04 | Pending generated code shimmers through the three theme colors in light and dark modes without changing its typography; ready and reduced-motion code have no shimmer. | ✅ Implemented | 🟡 P1 |
| EDITOR-05 | Generated TypeScript containing only a default-colored identifier also leaves its pending state when Monaco finishes initialization. | ✅ Implemented | 🔴 P0 |
| EDITOR-06 | Generated code blends from pending shimmer to syntax colors over 300 ms without changing its editor layout. | ✅ Implemented | 🟡 P1 |
| EDITOR-07 | Editable JSON stays pending until colored Monaco tokens appear and blends into syntax colors on initialization. | ✅ Implemented | 🔴 P0 |
| EDITOR-08 | The minimal editor highlights editable JSON with no Monaco network requests or workers. Light and dark modes preserve the same typography and padding. | ✅ Implemented | 🟡 P1 |
| SCROLL-01 | The themed area has vertical and horizontal overflow and responds to wheel scrolling. | ✅ Implemented | 🟢 P2 |
