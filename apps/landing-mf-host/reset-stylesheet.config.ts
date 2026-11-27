import type { RspackPluginInstance } from '@rspack/core';

const pluginName = 'ResetStylesheetUrl';
const resetStylesheetUrl = '/assets/ui-theme/reset.css';

/**
 * Give the stylesheet and its preload the same URL from the current compilation.
 */
export const resetStylesheetUrlPlugin: RspackPluginInstance = {
  apply(compiler) {
    const { HtmlRspackPlugin } = compiler.webpack;

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      const { beforeEmit } = HtmlRspackPlugin.getCompilationHooks(compilation);

      beforeEmit.tap(pluginName, (data) => {
        const resetAsset = compilation.getAssets().find(({ name }) => (
          /^assets\/ui-theme\/reset\.[a-f\d]{16}\.css$/.test(name)
        ));

        if (!resetAsset) {
          throw new Error('The build is missing the hashed UI theme reset stylesheet.');
        }

        const html = data.html.replaceAll(resetStylesheetUrl, `/${resetAsset.name}`);

        return { ...data, html };
      });
    });
  },
};
