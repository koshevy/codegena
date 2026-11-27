# Playground UI end-to-end test cases

This catalogue first groups tests by the source specification behind the story's graph: **JSON Schema** or **OAS3**. Within each scenario, cases are grouped by the user workflow they protect. A context-menu action belongs with the behavior it changes. Each workflow has a Playwright spec under its scenario directory; helpers used by one scenario live beside its specs. Storybook provides the starting state, but a story alone does not count as an implemented test.

The [E2E classification ADR](adr/001-classify-browser-tests-by-scenario-and-workflow.md) explains how to place, track, and reclassify cases. Add or update a catalogue row before writing a test, then set its final status after verifying the assertion.

**Status legend:**

- ✅ **Implemented** — an automated assertion runs in the E2E target. The
  **existing** note identifies tests that predate this catalogue.
- 🚧 **Partially implemented** — some described behavior is asserted; text
  after a colon names the covered part when provided.
- 📝 **Planned** — classified, without an automated assertion yet.

**Priority legend:**

- 🔴 **P0** — reported regressions and critical interactions.
- 🟡 **P1** — normal cross-panel behavior.
- 🟢 **P2** — broader states and negative paths.

Vary graph/list mode, Show selected/Show all scope, zero/one/multiple selections, and Light/Dark/System only where the variation changes the expected behavior. Avoid a full Cartesian product of these dimensions.

## JSON Schema graphs — [`e2e/json-schema/`](e2e/json-schema/)

These stories use JSON Schema fixtures, including the comprehensive schema and smaller focused schemas.

### Conversion — [`conversion.spec.ts`](e2e/json-schema/conversion.spec.ts)

| ID | Test case | Status | Priority |
| --- | --- | --- | --- |
| CONVERT-01 | Converting the account schema reveals its generated file and hides the conversion placeholder. | ✅ Implemented | 🟡 P1 |

### Source schema editor — [`source-editor.spec.ts`](e2e/json-schema/source-editor.spec.ts)

Source editing, Monaco stability, source-line controls, and editor-owned actions belong here.

| ID | Test case | Status | Priority |
| --- | --- | --- | --- |
| SRC-01 | Scrolling generated files leaves the same source Monaco DOM editor mounted. | ✅ Implemented | 🔴 P0 |
| SRC-02 | Mounting every generated editor during virtual scrolling leaves the source model, cursor, scroll position, and undo state unchanged; frame-by-frame samples detect any temporary loss of JSON token colors. | ✅ Implemented | 🔴 P0 |
| SRC-03 | A source declaration glyph explains its action in a themed tooltip, then reveals the corresponding node in the active graph/list and generated details; repeating the reveal scrolls to the node again. | 🚧 Partially implemented: tooltip and repeated list reveal | 🟡 P1 |
| SRC-04 | Warning-only and combined source glyphs offer the correct independent actions without widening or misaligning the gutter. | 📝 Planned | 🟡 P1 |
| SRC-05 | Monaco's context menu permits Copy, Paste in the editable source, and Go to Symbol; product-wide menus do not replace it. | 🚧 Partially implemented: menu actions and symbol navigation | 🟢 P2 |
| SRC-06 | The source-panel Copy whole schema button copies the current edited JSON value and shows success feedback. | ✅ Implemented | 🟡 P1 |
| SRC-07 | Monaco suppresses built-in schema warnings and requests while retaining JSON syntax errors; source warnings come from Codegena. | ✅ Implemented | 🟡 P1 |
| SRC-08 | F12 on a local `$ref` reveals its declaration in the same JSON editor, including JSON Pointer escapes, array items, and named anchors. External references do not navigate. | ✅ Implemented | 🟡 P1 |
| SRC-09 | Source and generated declaration glyphs are vertically centered in their Monaco line slots. | ✅ Implemented | 🟡 P1 |

### Generated graph and list — [`generated-views.spec.ts`](e2e/json-schema/generated-views.spec.ts)

The central views share graph-node identity and selection, while retaining their own viewport and expansion state.

| ID | Test case | Status | Priority |
| --- | --- | --- | --- |
| VIEW-01 | Selecting `zero-level.ts` after a source reveal keeps the scrolled file list near the selected item instead of jumping to the top. | ✅ Implemented · existing | 🔴 P0 |
| VIEW-02 | Graph → List → Graph preserves graph pan/zoom and list expansion/scroll without showing the inactive graph through the list. | ✅ Implemented | 🔴 P0 |
| VIEW-03 | Single and Shift-multiple selections remain synchronized between graph and list; clearing selection works in either view. | ✅ Implemented | 🔴 P0 |
| VIEW-04 | File and declaration menus offer selection, two details scopes, warnings, and declaration actions in both views; declaration menus also reveal the specification. Unavailable actions are disabled. | 📝 Planned | 🟡 P1 |
| VIEW-05 | The central header enables Collapse/Expand all only when applicable, hides Expand all directories when there are no directories, and its Clear selection action agrees with the graph-background menu. Opening a menu does not select a node. | 🚧 Partially implemented: expand/collapse and absent directory action | 🟡 P1 |
| VIEW-06 | With no graph selection, import and reference edges remain solid and distinct, and the graph-background Clear selection action is disabled. | ✅ Implemented | 🟡 P1 |
| VIEW-07 | Selecting the comprehensive file implicitly selects its sole declaration and activates their edges; clearing restores the baseline. Selecting the declaration instead implicitly selects the file and activates the same edges. | ✅ Implemented | 🟡 P1 |
| VIEW-08 | Shift-selecting `ZeroLevel` after the comprehensive file marks the intervening first-, eighth-, and ninth-level files and declarations implicit and activates every edge between selected path nodes. | ✅ Implemented | 🟡 P1 |
| VIEW-09 | In the persistent comprehensive list, selecting `first-level.ts`, scrolling to the end, then selecting `simple-object-with-properties.ts` keeps the latter file's row visible after it expands. | ✅ Implemented | 🔴 P0 |
| VIEW-10 | The list defaults to alphabetical filename/name order for files and declarations; its Sort by control switches to source-location order, remains selected across graph/list toggles, and is hidden in graph mode. | ✅ Implemented | 🟡 P1 |
| VIEW-11 | The comprehensive graph places its root file near the vertical center of the generated file groups without overlapping containers. | ✅ Implemented | 🟡 P1 |
| VIEW-12 | Selecting a declaration from the source editor reveals its graph node and repeated reveal refocuses it; selecting or deselecting nodes inside the graph does not move the viewport. | ✅ Implemented | 🟡 P1 |
| VIEW-13 | A file with multiple declarations keeps its small muted data-type count in the generated-files list. | ✅ Implemented | 🟢 P2 |
| VIEW-14 | The comprehensive graph legend lists its visible import and reference relations, without a placement chip when no placement edge exists. | ✅ Implemented | 🟡 P1 |
| VIEW-15 | Selecting the comprehensive file renders its active Import and Reference edges above every inactive edge. | ✅ Implemented | 🔴 P0 |
| VIEW-16 | Right-clicking blank List space opens the header actions, clicking blank space clears selection, and a row keeps its hover appearance while its menu is open. Graph background actions stay unchanged. | ✅ Implemented | 🟡 P1 |
| VIEW-17 | The generated-output header uses space for counts, legend, and controls without a visible title or icon; its context menu remains accessible. | ✅ Implemented | 🟢 P2 |

### Generated file details — [`generated-file-details.spec.ts`](e2e/json-schema/generated-file-details.spec.ts)

This group owns the selected/all scope, file reveal, and the virtualized generated-code editors.

| ID | Test case | Status | Priority |
| --- | --- | --- | --- |
| DETAIL-01 | Show selected with no selection displays the placeholder; its link switches to Show all and reveals generated files. | ✅ Implemented | 🔴 P0 |
| DETAIL-02 | Traversing the long file list initializes the correct Monaco model and syntax for **every** file as it enters view, even when generated Storybook HTML changes. The page must not reload or reset the details panel; offscreen editors need not remain mounted. | ✅ Implemented | 🔴 P0 |
| DETAIL-03 | Files are alphabetical. Single and Shift-multiple selections preserve the chosen Show all or Show selected scope; in Show all, selection scrolls to the file. | 🚧 Partially implemented: scope preservation | 🟡 P1 |
| DETAIL-04 | Revealing an offscreen file scrolls to it without a decorative blue highlight. | 📝 Planned | 🟡 P1 |
| DETAIL-05 | Prepending files, streaming output, resizing cards, and restoring a snapshot preserve the intended virtual-list anchor. | 🚧 Partially implemented: prepend, stream, and snapshot restoration | 🟢 P2 |
| DETAIL-06 | The generated-code context menu offers Copy only; the editable source retains its own Copy, Paste, and Go to Symbol actions. | ✅ Implemented | 🟢 P2 |
| DETAIL-07 | Generated-file reveal scrolls smoothly for lists of at most 15 files and immediately for longer lists. | ✅ Implemented | 🟡 P1 |
| DETAIL-08 | In Show all, a selected file or declaration gives its generated-file card a soft outline without changing its header; other cards stay neutral, and Show selected removes the outline. | ✅ Implemented | 🟡 P1 |
| DETAIL-09 | A generated-file header copies the complete file text and shows success feedback. | ✅ Implemented | 🟡 P1 |
| DETAIL-10 | A generated-file header downloads the complete file text under its generated filename. | ✅ Implemented | 🟡 P1 |
| DETAIL-11 | Download all builds a ZIP of every generated file even in Show selected, keeps the button pending for at least three seconds, and offers a notification action that downloads the named archive. | ✅ Implemented | 🟡 P1 |
| DETAIL-12 | Download all reuses the ready archive on a later click without a pending state and downloads it directly. | ✅ Implemented | 🟡 P1 |
| DETAIL-13 | Archive preparation failure restores the button and shows an error notification. | ✅ Implemented | 🟢 P2 |
| DETAIL-14 | Generated TypeScript keeps syntax colors and folding but shows no type hover, inlay hints, or validation markers. | ✅ Implemented | 🟡 P1 |
| DETAIL-15 | Revealing `first-level.ts` in Show all scrolls to its card without a blue highlight, including after scrolling away and back. | ✅ Implemented | 🔴 P0 |
| DETAIL-16 | A declaration glyph beside its generated TypeScript line explains its navigation in a themed tooltip and reveals the matching source-schema line; pointer and keyboard activation work without changing the generated editor. | ✅ Implemented | 🟡 P1 |
| DETAIL-17 | Selecting a generated-code glyph in a file with several declarations explicitly selects its declaration and implicitly selects the file, replacing an earlier explicit file selection. | ✅ Implemented | 🟡 P1 |
| DETAIL-18 | Shift-selecting a second declaration in the same file activates the declaration just clicked in its generated editor, even when graph order lists that declaration first. | ✅ Implemented | 🟡 P1 |
| DETAIL-19 | Revealing a generated file places its card 0.5rem below the details viewport edge. | ✅ Implemented | 🟡 P1 |
| DETAIL-20 | In Show all, clicking a generated-file card's icon or title selects and reveals its file in the active graph or tree view; Shift-click adds it to the selection and reveals distant files. In Show selected, the icon and title are static. | ✅ Implemented | 🟡 P1 |

### Warnings and clipboard — [`warnings.spec.ts`](e2e/json-schema/warnings.spec.ts)

Diagnostic scope, exact navigation, the warning/list context menus, clipboard output, and immediate copy feedback belong here.

| ID | Test case | Status | Priority |
| --- | --- | --- | --- |
| WARN-01 | The Has warnings shortcut scrolls until the warnings section and a warning card are visible, even while virtual file heights settle. | ✅ Implemented · existing | 🔴 P0 |
| WARN-02 | Copy warning writes the complete location, message, numbered source excerpt, and caret, then shows one success notification. | ✅ Implemented | 🔴 P0 |
| WARN-03 | Copy all warnings writes the displayed warnings in source-line order and shows one count-aware success notification. | ✅ Implemented | 🔴 P0 |
| WARN-04 | A rejected clipboard write produces failure feedback rather than a false success. | 📝 Planned | 🟡 P1 |
| WARN-05 | A source warning reveals and highlights the exact virtual row, including a repeated reveal after scrolling away; a graph/list warning action reveals it without that highlight or an unwanted selection toggle. | 🚧 Partially implemented | 🟡 P1 |
| WARN-06 | Show selected and Show all use the correct warning scope, deduplicate entries, and sort by line; warning-only source lines remain reachable. | 📝 Planned | 🟡 P1 |
| WARN-07 | Warning actions are absent or disabled when no relevant warning exists, and the shortcut hides once a warning is sufficiently visible. | 📝 Planned | 🟢 P2 |
| WARN-08 | Codegena warnings appear as Monaco diagnostics spanning the JSONC value at their source location, including the `{}` on line 271 of the comprehensive schema. | ✅ Implemented | 🟡 P1 |
| WARN-09 | A Codegena diagnostic in Monaco's problem viewer offers **View in file details** and opens the matching warning row in the details panel. | ✅ Implemented | 🟡 P1 |
| WARN-10 | After F8 navigates to a warning, hovering its source text opens the themed Monaco hover. The highlight starts at the line's left edge and ends at the related JSONC value; the hover fits the editor width and uses body text and shadow without a border or quick-fix footer. | ✅ Implemented | 🟡 P1 |
| WARN-11 | After Go to Line settles, hovering marked source rows near the beginning, middle, and end of the schema opens a warning with **View in file details**; the link reveals the matching warning row, and clicking it again retriggers the yellow highlight. | ✅ Implemented | 🔴 P0 |
| WARN-12 | In the persistent comprehensive graph, a declaration warning action in Show selected reveals a warning in details and hides the floating shortcut when the warning is visible. | ✅ Implemented | 🔴 P0 |

### Theme and notifications — [`theme-and-notifications.spec.ts`](e2e/json-schema/theme-and-notifications.spec.ts)

Appearance selection and notification integration belong here. Detailed transport rules remain owned by `notification-ui-notistack` tests; Playground checks that the integration works in context.

| ID | Test case | Status | Priority |
| --- | --- | --- | --- |
| THEME-01 | The Appearance menu aligns its right edge with the header button; switching Light → Dark changes the Playground surface and marks Dark as the selected option. | ✅ Implemented | 🟡 P1 |
| THEME-02 | Notifications triggered in Dark mode use the dark palette, including a grouped stack and its controls. | ✅ Implemented | 🔴 P0 |
| THEME-03 | A notification appears after a successful action and can be dismissed. | 📝 Planned | 🔴 P0 |
| THEME-04 | Repeated messages with the same title and fallback message produce one active notification; distinct messages remain distinct. | 📝 Planned | 🔴 P0 |
| THEME-05 | System follows later operating-system color-scheme changes, and Light/Dark/System remain mutually exclusive menu choices. | 📝 Planned | 🟡 P1 |
| THEME-06 | Many distinct messages form a stable, readable, scrollable overflow group. | 📝 Planned | 🟢 P2 |
| THEME-07 | Light and Dark use their named palettes when the operating-system appearance is opposite. Dark renders while the search worker is starting, and its search API connects once the worker is ready. | ✅ Implemented | 🔴 P0 |

### Layout and panels — [`layout-and-panels.spec.ts`](e2e/json-schema/layout-and-panels.spec.ts)

This group covers column lifecycle, layout persistence, and menus that control the page layout.

| ID | Test case | Status | Priority |
| --- | --- | --- | --- |
| LAYOUT-01 | Source and details columns can be hidden and restored with their header controls. | ✅ Implemented | 🟡 P1 |
| LAYOUT-02 | The first selection opens panels; later selections respect manual closure unless warning navigation requires details. Shift selection does not reopen closed panels. | 📝 Planned | 🟡 P1 |
| LAYOUT-03 | Resizing maintains separators and minimum widths without resetting graph zoom. | 📝 Planned | 🟡 P1 |
| LAYOUT-04 | The persistence story restores open panels, widths, and header toolbar state after reload; graph/list transient state survives view toggles but not a new session. | 📝 Planned | 🟡 P1 |
| LAYOUT-05 | Side-header menus hide the correct column; the fallback menu toggles source, details, and output view without interfering with Monaco or warning menus. | 📝 Planned | 🟡 P1 |
| LAYOUT-06 | Non-editor product surfaces suppress the native browser menu and do not select text unintentionally. | 📝 Planned | 🟢 P2 |
| LAYOUT-07 | Fresh preferences default to alphabetical sorting and System appearance; changing both choices persists them across reload. | ✅ Implemented | 🟡 P1 |
| LAYOUT-08 | Hiding, restoring, and dragging the source panel keep graph nodes at the same screen position and preserve graph zoom. | ✅ Implemented | 🔴 P0 |

## OAS3 graphs — [`e2e/oas3/`](e2e/oas3/)

### Conversion — [`conversion.spec.ts`](e2e/oas3/conversion.spec.ts)

| ID | Test case | Status | Priority |
| --- | --- | --- | --- |
| OAS3-CONVERT-01 | The GitHub REST API story finishes converting its large specification and shows the complete generated-file count. | ✅ Implemented | 🔴 P0 |

### Large specification loading and lists — [`large-lists.spec.ts`](e2e/oas3/large-lists.spec.ts)

| ID | Test case | Status | Priority |
| --- | --- | --- | --- |
| OAS3-LARGE-01 | While the GitHub story initializes, the open source editor and graph show loading skeletons; both disappear when their real views are ready. | ✅ Implemented | 🟡 P1 |
| OAS3-LARGE-02 | The GitHub file list remains scrollable across its 5257 files, while bulk Expand/Collapse actions for files and directories are disabled above 1000 total entries. | ✅ Implemented | 🔴 P0 |
| OAS3-LARGE-03 | Pressing Enter on a large-tree row's Expand button opens its children without selecting the row. | ✅ Implemented | 🟡 P1 |
| OAS3-LARGE-04 | After selecting `apps` and scrolling the GitHub file tree, selecting `code-scanning` keeps that directory selected and within the visible list area. | ✅ Implemented | 🔴 P0 |

### Source schema editor — [`source-editor.spec.ts`](e2e/oas3/source-editor.spec.ts)

| ID | Test case | Status | Priority |
| --- | --- | --- | --- |
| OAS3-SRC-01 | Reloading with both side panels open keeps JSON code pending until Monaco renders colored tokens, then blends into syntax colors while preserving the open panels. | ✅ Implemented | 🔴 P0 |
| OAS3-SRC-02 | After the large GitHub graph is ready and remains open for 20 seconds, its source JSON editor leaves pending state and shows syntax-colored tokens without returning to pending. | ✅ Implemented | 🔴 P0 |

### Search — [`search.spec.ts`](e2e/oas3/search.spec.ts)

Search indexes the graph, collected warnings, and source specification from
the story's generated fixture. Selection follows the real graph and editor
navigation paths.

| ID | Test case | Status | Priority |
| --- | --- | --- | --- |
| OAS3-SEARCH-01 | The search drawer opens centered over the page; a real virtual HTTP search returns matching results; selecting a declaration inside a collapsed directory selects its graph node, reveals its generated file and line, and navigates the source editor. | ✅ Implemented | 🟡 P1 |
| OAS3-SEARCH-02 | An unmatched query shows a clear empty state without opening an empty suggestion popup; Escape closes search. | ✅ Implemented | 🟡 P1 |
| OAS3-SEARCH-03 | Search offers warnings collected from the generated graph; choosing one closes the drawer and reveals the matching source line and warning details. | ✅ Implemented | 🟡 P1 |
| OAS3-SEARCH-04 | A file result shows its path once; a declaration result identifies its generated filename beneath the declaration name. | ✅ Implemented | 🟡 P1 |
| OAS3-SEARCH-05 | A visited declaration appears first when the drawer opens without a query, including after a page reload for the same specification. | ✅ Implemented | 🟡 P1 |
| OAS3-SEARCH-06 | A specification search result opens the source editor at the matched text. | ✅ Implemented | 🟡 P1 |
| OAS3-SEARCH-07 | A visit in one open tab updates the default suggestions in another tab for the same specification. | ✅ Implemented | 🟡 P1 |
| OAS3-SEARCH-08 | A declaration selected directly in the graph becomes a recent default suggestion. | ✅ Implemented | 🟡 P1 |
| OAS3-SEARCH-09 | Typing a matching phrase at a 150 ms cadence keeps the suggestion list open; consecutive unmatched characters keep the empty state visible. | ✅ Implemented | 🟡 P1 |
| OAS3-SEARCH-10 | While a matching query is extended, an existing suggestion stays visible and enabled instead of briefly fading before the next results arrive. | ✅ Implemented | 🟡 P1 |
| OAS3-SEARCH-11 | A single Shift press leaves search closed; pressing Shift again quickly opens the drawer and focuses its search field from another page control. | ✅ Implemented | 🟡 P1 |
| OAS3-SEARCH-12 | Searching for `TCode` shows a multiline generated-code excerpt; choosing its first excerpt result selects the same `TCode extends` line in file details. | ✅ Implemented | 🔴 P0 |
| OAS3-SEARCH-13 | In the GitHub story, broad `copilot` search includes directories, declarations, and files within 100 results and explains when matches are omitted; refining to `CopilotSeatDetails` shows its declaration and generated file. | ✅ Implemented | 🔴 P0 |
| OAS3-SEARCH-14 | In the GitHub story, `User` places matching declaration titles first and files with matching code excerpts before lowercase directories; `user` places matching lowercase paths first. | ✅ Implemented | 🟡 P1 |
| OAS3-SEARCH-15 | Searching `Users` in the GitHub story shows the same-case match in the specification excerpt, scrolls its long line to reveal the match, keeps line numbers visible during horizontal scrolling, and uses the themed scrollbar. | ✅ Implemented | 🟡 P1 |
| OAS3-SEARCH-16 | End and Enter navigate through the long virtual suggestion list with an active, visible option and open the chosen result. | ✅ Implemented | 🟡 P1 |
| OAS3-SEARCH-17 | Opening search on the 1Password story shows all ten default suggestions, including its warning, without scrolling at a 720px viewport height. | ✅ Implemented | 🟡 P1 |
| OAS3-SEARCH-18 | Open search, close it, reload the story, and search for `ApiRequest`. Default and matching suggestions remain available without page errors or console warnings/errors. | ✅ Implemented | 🔴 P0 |

The 1Password stories generate their graphs from the 1Password Connect OpenAPI
fixture. The GitHub search cases use the GitHub REST API fixture. The directory
hierarchy story uses the 1Password specification without saved layout state,
so each test starts from its current generated directories and files.

### Generated graph and list — [`generated-views.spec.ts`](e2e/oas3/generated-views.spec.ts)

| ID | Test case | Status | Priority |
| --- | --- | --- | --- |
| OAS3-VIEW-01 | The 1Password OpenAPI story loads its source and generated directory hierarchy, then restores a chosen Graph/List view after reload. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-02 | An OAS output directory starts collapsed in the graph. Expanding each directory in turn reveals its nested directories, files, and namespaces; the generated-files list shows the same hierarchy. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-03 | A graph file card gives its declaration equal top, left, right, and bottom insets at 100% zoom. | ✅ Implemented | 🟢 P2 |
| OAS3-VIEW-04 | Each nested directory, file, and declaration row in the standalone generated-files list gains 1rem of left indentation per level. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-05 | Switching to the 1Password graph keeps the root open and first-level directories collapsed; reopening a real directory leaves its deeper children collapsed. | ✅ Implemented | 🔴 P0 |
| OAS3-VIEW-06 | A graph directory card selects and deselects independently of its expand button. Its title and direct child counts remain visible, and the expand button leaves selection unchanged. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-08 | Root, collapsed directory, and generated file cards hide handles without a visible edge; expanding a directory reveals its newly connected handle. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-09 | Hovering graph directory titles shows themed tooltips identifying the full directory path, including the `./` root. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-10 | The graph root has no collapse control and stays open on double-click; real directories still toggle on double-click. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-11 | The 1Password graph orders root directories by name before its root file, and preserves that order when Items expands. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-12 | After expanding Health and Check Liveness, the root index.ts stays beside the root's direct directories instead of moving to a deeper layout layer. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-13 | After expanding Items and each direct subdirectory, collapsing Items animates its card back into the graph viewport without changing its settled zoom. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-15 | Select the graph root, then hold Shift while clicking a nested generated file. The intervening directories become implicit selections and every placement edge between them activates; the search drawer stays closed. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-16 | Explicitly selecting one or several graph directories implicitly selects their direct child directories and files, without selecting grandchildren of an implicit directory. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-18 | By source file and line lists files directly with their full paths. Generated common barrels follow the files with source locations. By filename restores the directory tree and shows each basename. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-19 | Selecting a collapsed tree directory expands it, uses the file selection color, and implicitly selects direct children; a second row click or Space deselects, while Space on an implicit child selects that child. Its expand button changes expansion only. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-20 | Selecting a directory shows its direct child directories before generated files in details, with left-aligned card contents; clicking a directory card makes it the only explicit selection and reveals its direct child files. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-21 | Selecting a nested directory from details expands its collapsed tree ancestors and reveals its selected row. Directory cards are absent in Show all. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-22 | Selecting and deselecting graph nodes keeps their screen position and zoom unchanged, including when the first selection opens details; expanding or collapsing a directory still centers that directory without changing zoom. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-23 | Revealing the line 140 Alias declaration from the 1Password source editor expands its collapsed graph ancestors, selects the declaration, and centers it. | ✅ Implemented | 🔴 P0 |
| OAS3-VIEW-24 | Each generated-files list directory describes its direct directory and file counts with the same wording as its graph node. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-25 | List mode shows total files and, under filename sorting, total directories. Graph mode shows both totals before a separated visible-edge legend; badges explain their scope in tooltips. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-26 | In Show all, selecting a directory with child directories shows a warning badge in the generated-file details header. The badge explains why those directories are hidden and switches details to Show selected; it stays absent without a qualifying selection. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-27 | The 1Password legend starts with Placement only. Expanding Common, Activity, or Metrics reveals Import edges and adds Import to the legend. Collapsing each directory restores Placement only. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-28 | With only Metrics expanded, Placement connects the directory to its files, Import connects the file chain, and sole declarations have no duplicate Reference edges. The legend lists only Import and Placement. | ✅ Implemented | 🔴 P0 |
| OAS3-VIEW-29 | Selecting a Metrics file renders active Placement and Import edges above every inactive edge. | ✅ Implemented | 🔴 P0 |
| OAS3-VIEW-30 | Graph/List header and background menus expand or collapse directories only when visible rows can change. Bulk expansion and collapse fit the completed graph, including actions performed in List before returning to Graph. Collapse all files leaves directories open, and hidden expanded descendants do not keep Collapse enabled. Directory-node menus place their toggle after selection and change that node alone. Source sorting disables directory actions. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-31 | Graph and list node menus reveal one file in selected details or among all files. Declaration menus offer Reveal in specification only while the source panel is hidden; the action opens that panel at the declaration. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-32 | Graph file, directory, and declaration headings show themed entity tooltips; graph and list declaration glyphs describe their navigation action. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-33 | Clicking a graph declaration glyph selects its node and opens both source-schema and generated-file details panels, even after they were manually hidden. | ✅ Implemented | 🟡 P1 |
| OAS3-VIEW-34 | Clicking a declaration or warning icon in Graph and List preserves an already selected declaration and its containing file; clicking the icon on an unselected declaration selects it and still reveals the related source, code, or warning. | ✅ Implemented | 🔴 P0 |
| OAS3-VIEW-35 | A constrained generated-files list shows directory counts above 20vw, hides them below 20vw, and keeps directory names readable at both widths. | ✅ Implemented | 🟡 P1 |

### Generated file details — [`generated-file-details.spec.ts`](e2e/oas3/generated-file-details.spec.ts)

| ID | Test case | Status | Priority |
| --- | --- | --- | --- |
| OAS3-DETAIL-01 | In Show all, generated-code glyphs for `_common/error-response.ts` and `items/update-subset-attributes/patch.ts` reveal their source lines, explicitly select and center the matching declarations, and implicitly select their files, including when a directory is collapsed. | ✅ Implemented | 🔴 P0 |
| OAS3-DETAIL-02 | In Show all, newly appearing generated editors keep their pending colors until TypeScript colors are rendered; editors already colored do not return to pending while scrolling. | ✅ Implemented | 🔴 P0 |

### Graph-to-details navigation — [`graph-to-file-details.spec.ts`](e2e/oas3/graph-to-file-details.spec.ts)

| ID | Test case | Status | Priority |
| --- | --- | --- | --- |
| OAS3-NAV-01 | In Show all, selecting the root namespace declaration reveals and highlights `index.ts`, selects its declaration line in generated code, and selects its source line. | ✅ Implemented | 🔴 P0 |
| OAS3-NAV-02 | Selecting `activity/index.ts`, then the root `index.ts`, reveals each file card, selects generated line 1, and navigates the source editor to the corresponding operation or document line. | ✅ Implemented | 🔴 P0 |
| OAS3-NAV-03 | Selecting the `ApiRequest` declaration reveals and highlights `activity/api-request.ts`, selects the interface line in generated code, and navigates the source editor to `APIRequest`. | ✅ Implemented | 🔴 P0 |
| OAS3-NAV-04 | After expanding Items and its common directory, selecting the directory focuses the first direct child file in details and leaves the next visible at 1728 × 1117. Fit View shows six active placement edges and eight active import edges, including those for the common barrel. Check browser diagnostics. | ✅ Implemented | 🟡 P1 |
| OAS3-NAV-05 | In Show selected, clicking the root declaration warning icon reveals a warning with the theme warning stripe and no excess blank space; the floating shortcut hides when the warning is visible. | ✅ Implemented | 🔴 P0 |

### List-to-details navigation — [`list-to-file-details.spec.ts`](e2e/oas3/list-to-file-details.spec.ts)

These cases adapt the 1Password navigation journey to the generated-files list. Directory expansion, selection, and cross-panel navigation are asserted separately from graph layout and edges.

| ID | Test case | Status | Priority |
| --- | --- | --- | --- |
| OAS3-LIST-01 | In List mode, expanding and collapsing Activity and Items changes descendant visibility without selecting their directory rows; selecting a collapsed directory expands it. | ✅ Implemented | 🟡 P1 |
| OAS3-LIST-02 | Selecting the root namespace declaration, Activity operation file, root file, and `ApiRequest` declaration in the central list reveals the corresponding generated file and line in the right panel and source line in the left panel. | ✅ Implemented | 🔴 P0 |
| OAS3-LIST-03 | Expanding Items and its common directory, then selecting that directory, reveals its direct child files in details while keeping the selected directory visible in the central list. | ✅ Implemented | 🟡 P1 |
| OAS3-LIST-04 | Starting in Show all, the root declaration's warning icon switches details to Show selected, reveals the warning, and hides the floating warnings shortcut while that warning is visible. | ✅ Implemented | 🔴 P0 |

## Implementation order

1. Finish **P0** browser regressions: source Monaco model stability, complete virtual-editor traversal, warning copying and feedback, dark notifications, notification deduplication, and view-state retention.
2. Cover **P1** navigation, selection, scope, context-menu actions, panel behavior, and persistence boundaries.
3. Cover **P2** failure and overflow cases, keyboard/focus behavior, virtual-list updates, and visual alignment.
4. Use stable accessible locators and condition-based waits. Add a narrow Storybook-only probe when user-visible behavior cannot prove Monaco instance or model identity. Stub clipboard success and failure independently. Keep screenshot and video capture in the existing Playwright configuration.

Run the suite with `npm exec -- nx e2e playground-ui-e2e`; use its Nx `lint` and `typecheck` targets after changing specs. The project [README](README.md) describes Storybook startup and artifact locations.

The landing's embedded browser cases also verify the optional host navigation
button after GitHub and the shared appearance provider during conversion,
example changes, and returning to the host. The `HostNavigation` Playground
story exposes the optional button independently.

The worker-conversion case waits for its actual source response before checking
generated output, so cold Storybook loading does not consume the conversion check.
