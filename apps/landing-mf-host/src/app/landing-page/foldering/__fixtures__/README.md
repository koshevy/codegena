# Landing file-tree fixture

`onepassword-generated-file-tree.graph.json` is a snapshot of the graph loaded
by the `GeneratedFilesList` **ConstrainedDirectories** story. Its source is
`packages/playground-ui/src/lib/__fixtures__/oas3-onepassword-connect.json`
(SHA-256: `50f3c4ad1c2bc2067a817191703248a0b400b009751e06740dbde28a94b47fc4`).

The landing page needs a ready hierarchy without running the TypeScript
generator in the browser. To refresh it after a generator change, load that
Storybook story, capture the `graph` returned by its `convertFixtureToGraph`
loader, then retain the nodes in their original order. Set top-level `edges`
and `logs` to empty arrays. Keep each node's identity, parent, kind, label,
file name, language, declaration type, source location, and item logs. The
file-list control does not use edges or top-level logs. Replace generated code
text with an empty string and each AST with an empty object; neither is shown
in this illustration. Update the source hash and review the landing story and
screenshots after refreshing the snapshot.
