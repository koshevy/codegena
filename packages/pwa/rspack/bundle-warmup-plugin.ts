import type { BundleWarmupManifestOptions } from '@codegena/pwa/bundle-warmup-config';
import {
  bundleWarmupManifestPathSchema,
  bundleWarmupManifestSchema,
  clientShellFilesSchema,
} from '@codegena/pwa/common';
import type { Compiler, RspackPluginInstance } from '@rspack/core';

import { getWarmupAssetFiles, getWarmupChunkFiles } from './get-warmup-chunk-files';
import { getWarmupRemoteFiles } from './get-warmup-remote-files';

const pluginName = 'BundleWarmupManifest';

export interface BundleWarmupPluginProps extends BundleWarmupManifestOptions {
  buildId: string;
}

/**
 * Resolve named chunk groups after Rspack assigns their final asset filenames.
 */
export class BundleWarmupPlugin implements RspackPluginInstance {
  constructor(private readonly props: BundleWarmupPluginProps) {}

  apply(compiler: Compiler): void {
    const {
      buildId,
      chunkGroups,
      clientShellGroup,
      manifestPath,
      remotePath,
    } = this.props;
    const outputPath = bundleWarmupManifestPathSchema.parse(manifestPath);
    const { Compilation, sources } = compiler.webpack;

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap({
        name: pluginName,
        stage: Compilation.PROCESS_ASSETS_STAGE_REPORT,
      }, () => {
        const groups = Object.fromEntries(Object.entries(chunkGroups).map(
          ([group, { assetPrefix, chunks, remoteExpose }]) => {
            const files = chunks.flatMap((name) => (
              getWarmupChunkFiles(compilation, name)
            ));

            if (assetPrefix) {
              files.push(...getWarmupAssetFiles(compilation, assetPrefix));
            }

            if (remoteExpose) {
              const remoteFiles = getWarmupRemoteFiles(
                compilation,
                remotePath,
                remoteExpose,
              );

              files.push(...remoteFiles);
            }

            return [group, [...new Set(files)].map((file) => `/${file}`)];
          },
        ));

        if (clientShellGroup) {
          clientShellFilesSchema.parse(groups[clientShellGroup]);
        }

        const manifest = bundleWarmupManifestSchema.parse({
          buildId,
          clientShellGroup,
          groups,
        });
        const source = new sources.RawSource(JSON.stringify(manifest));

        compilation.emitAsset(outputPath, source);
      });
    });
  }
}
