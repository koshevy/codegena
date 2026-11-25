import { createMonacoViteConfig } from '@codegena/ui-unified/monaco-vite';
import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';

const muiIconsEsmPath = fileURLToPath(new URL(
  'esm/$1.js',
  import.meta.resolve('@mui/icons-material'),
));

const config: StorybookConfig = {
  stories: [
    '../panels/**/*.stories.@(ts|tsx)',
    '../menus/**/*.stories.@(ts|tsx)',
    '../buttons/**/*.stories.@(ts|tsx)',
    '../icons/**/*.stories.@(ts|tsx)',
    '../branding/**/*.stories.@(ts|tsx)',
    '../feedback/**/*.stories.@(ts|tsx)',
    '../files/**/*.stories.@(ts|tsx)',
    '../counts/**/*.stories.@(ts|tsx)',
    '../scrolling/**/*.stories.@(ts|tsx)',
    '../code-editor/**/*.stories.@(ts|tsx)',
    '../under-construction/**/*.stories.@(ts|tsx)',
    '../we-use-cookies/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: { defaultName: 'README' },
  viteFinal: (viteConfig) => {
    const monacoConfig = mergeConfig(viteConfig, createMonacoViteConfig());

    return mergeConfig(monacoConfig, {
      optimizeDeps: {
        // The highlighter is ESM. Keep lazy stories from triggering a dependency reload.
        exclude: ['@tanstack/highlight'],
        // Include icons behind workspace barrels before the first story loads.
        include: [
          '@mui/icons-material/LinkedIn',
          '@mui/icons-material/X',
        ],
      },
      resolve: {
        // MUI 5 icon subpaths expose CJS; use its ESM build in Vite.
        alias: [{
          find: /^@mui\/icons-material\/([^/]+)$/,
          replacement: muiIconsEsmPath,
        }],
        tsconfigPaths: true,
      },
    });
  },
};

export default config;
