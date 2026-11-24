# Landing shader dependency fix

The landing's Nx tasks apply this patch through the workspace's
`apply-dependency-patches` target. The target fails if a patch no longer
applies. Review the patch when upgrading the affected dependency.

## `shaders` 4.0.7

The landing's live GPU test exposes two defects in the package's bundled
TypeGPU compiler and noise function:

- Fragment inputs such as `in.uv` are local struct members. Register them
  alongside builtin inputs so external resolution preserves them instead of
  reporting `external-omitted`. Builtins still resolve to positional arguments.
- The unsigned rotation in `mxRotl32` must use `>>>`, including its compiled
  syntax metadata. TypeGPU emits the same WGSL unsigned shift without a
  deprecation warning.

These fixes keep diagnostics enabled and preserve the intended WGSL in the
shared core module used by the renderer and effect definitions.

The `shaders/js` entrypoint loads the built-in shader registry on demand.
The landing blob passes `includeBuiltInShaders: false` and
supplies the Blob definition through `components`. Other callers get the full
registry by default.

Verify rendering, pause/resume, and browser diagnostics on desktop and iPhone 15:

```sh
npm exec -- nx run landing-mf-host-e2e:e2e --skipNxCache --args='screen-02-blob-gpu.spec.ts --retries 0'
```
