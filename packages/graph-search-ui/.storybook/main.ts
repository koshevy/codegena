import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: { defaultName: 'README' },
  viteFinal: (viteConfig) => mergeConfig(viteConfig, {
    resolve: { tsconfigPaths: true },
  }),
};

export default config;
