# Bundle warmup configuration

Use `@codegena/pwa/bundle-warmup-config` to type the application settings
shared by the manifest build and the browser warmup schedule. Each application
owns its group names, chunk names, and warmup timing.

## Example

```ts
import type { BundleWarmupConfig } from '@codegena/pwa/bundle-warmup-config';

export const warmupConfig: BundleWarmupConfig<'home', 'contentReady'> = {
  manifestPath: 'bundle-warmup.json',
  chunkGroups: {
    navigation: { chunks: ['navigation-overlay'] },
    examples: { chunks: ['example-panel'] },
  },
  warmupGroups: {
    warmAfterPaintedGroups: { home: ['navigation'] },
    extrasGroups: { contentReady: ['examples'] },
  },
};
```

The route key `home` and the turn name `contentReady` belong to this
application. The group names listed in `warmupGroups` refer to keys in
`chunkGroups`.

## Types

- `BundleWarmupConfig` describes the full settings. Its optional type
  parameters constrain the navigation keys and extras turn names.
- `BundleWarmupManifestOptions` describes the manifest output path, the
  optional startup group for client-rendered reloads, and the groups to emit.
  Each `BundleWarmupChunkGroup` identifies chunk groups, optional copied
  assets, or an optional Module Federation expose.
- `BundleWarmupGroups` describes the schedule. `NavigationWarmupGroups`
  maps a navigation key to groups warmed after paint.
  `BundleWarmupExtrasGroups` maps a turn name to groups warmed once when
  that turn is ready.

At build time, pass the manifest options and the current build ID to
`BundleWarmupPlugin` from `@codegena/pwa/rspack`. In the browser, pass the
selected navigation groups, the extras groups, and the current turn to
`useBundleWarmup` from `@codegena/pwa/bundle-warmup`.

The worker uses `defaultBundleWarmupManifestPath` when a warmup request omits
its manifest path.

See the [build identity and warmup decision](../adr/002-identify-browser-workers-by-application-build.md).
