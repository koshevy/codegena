import {
  monacoExcludedFeatureImports,
  monacoExcludedFullFeatureImports,
  monacoFullFeatureImporter,
  monacoFeatureImporters,
} from '@codegena/ui-unified/monaco-webpack';
import { fileURLToPath } from 'node:url';
import { transformWithOxc, type UserConfig } from 'vite';

/**
 * Bind Monaco's worker lookup through Vite 8's public Oxc transform API.
 * Merge into the Vite config before loading the monaco-workers entrypoint.
 */
export function createMonacoViteConfig(): UserConfig {
  return {
    optimizeDeps: { exclude: ['monaco-editor'] },
    resolve: {
      alias: [{
        find: /^monaco-editor\/esm\/vs\/editor\/editor\.main\.js$/,
        replacement: fileURLToPath(
          import.meta.resolve('@codegena/ui-unified/monaco-bootstrap'),
        ),
      }],
    },
    plugins: [{
      name: 'codegena-monaco-feature-imports',
      transform: {
        filter: {
          id: { include: [...monacoFeatureImporters, monacoFullFeatureImporter] },
        },
        handler(code, id) {
          const exclusions = monacoFullFeatureImporter.test(id)
            ? monacoExcludedFullFeatureImports
            : monacoExcludedFeatureImports;

          return code.replaceAll(
            /^import ['"]([^'"]+)['"];\r?\n/gm,
            (statement: string, specifier: string) => (
              exclusions.has(specifier) ? '' : statement
            ),
          );
        },
      },
    }, {
      name: 'codegena-monaco-environment',
      transform: {
        filter: {
          id: /\/monaco-editor\/esm\/vs\/base\/browser\/browser\.js(?:\?.*)?$/,
        },
        handler(code, id) {
          return transformWithOxc(code, id, {
            inject: {
              'globalThis.MonacoEnvironment': [
                '@codegena/ui-unified/monaco-environment',
                'monacoEnvironment',
              ],
            },
          });
        },
      },
    }],
  };
}
