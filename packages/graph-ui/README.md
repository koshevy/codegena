# @codegena/graph-ui

React Flow and MUI view for Codegena graph payloads. It displays generated
files as containers, their declarations as child nodes, and import/reference
relations as separate edges. Code and source-schema actions are visible
placeholders for future integrations.

Declarations follow source order inside each file. ELK places the file
containers from their import relations and measured heights. Layout is
asynchronous and belongs to this view; graph payloads need no coordinates.
See the [layout decision](adr/001-layout-file-groups-with-elk.md).

The component uses the surrounding MUI theme. Storybook applies the light and
dark themes from `@codegena/ui-theme` to fixture-derived graph examples.

Run the stories with `npm exec -- nx run graph-ui:storybook`.
