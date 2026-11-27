import { codegenaStorybookPreview } from '@codegena/ui-theme/storybook';
import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  ...codegenaStorybookPreview,
  loaders: [async ({ parameters }) => {
    if (parameters['useMonaco'] === true) {
      await import('@codegena/ui-unified/monaco-workers');
    }

    return {};
  }],
};

export default preview;
