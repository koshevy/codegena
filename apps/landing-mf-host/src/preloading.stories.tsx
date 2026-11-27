import type { Meta, StoryObj } from '@storybook/react';

import preloadingDocument from './index.html?raw';

const meta: Meta = {
  parameters: { layout: 'fullscreen' },
  title: 'Codegena/Landing/Startup',
};

export default meta;

export const Preloading: StoryObj = {
  render: () => (
    <iframe
      sandbox=""
      srcDoc={preloadingDocument}
      style={{ border: 0, display: 'block', height: '100dvh', width: '100%' }}
      title="Landing startup"
    />
  ),
};
