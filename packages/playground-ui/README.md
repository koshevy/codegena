# @codegena/playground-ui

Import features from their own entrypoints. Use
`@codegena/playground-ui/generated-files-list` for the file tree and
`@codegena/playground-ui/playground` for the full Playground. Each feature
directory has an entrypoint, and the root package re-exports them for
existing consumers.

React components for exploring a JSON Schema alongside generated TypeScript files and their dependency graph. `Playground` combines a Monaco schema editor, selectable file list or graph, and a resizable generated-code details area.

Run `npm exec -- nx storybook playground-ui` to browse component stories.

Hosts can wrap loading and ready views in
`PlaygroundAppearanceProvider` from `@codegena/playground-ui/appearance`,
passing `mode` and `onModeChange` to share their theme with Playground.
Supply `onSandwichButtonClick` to Playground to show a host-navigation button
after GitHub. Without these integrations, Playground keeps its saved preferences.

The package's [architecture decisions](adr/README.md) explain its layout, navigation, editor, and diagnostics contracts.
