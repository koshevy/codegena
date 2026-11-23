import { codegenaStorybookPreview } from '@codegena/ui-theme/storybook';
import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  ...codegenaStorybookPreview,
  parameters: {
    ...codegenaStorybookPreview.parameters,
    layout: 'centered',
  },
};

export default preview;
