import { useBundleWarmup } from '@codegena/pwa/bundle-warmup';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

import { AppearanceProvider } from './appearance';
import { LandingRoute } from './landing-page';

const storyWarmup = {
  warmAfterPaintedGroups: [],
  extrasGroups: {},
} as const;

const meta: Meta<typeof LandingRoute> = {
  component: LandingRoute,
  parameters: {
    codegenaTheme: 'dark',
    layout: 'fullscreen',
  },
  title: 'Codegena/Landing/Host',
  render: function Render(args) {
    const { hasPainted } = useBundleWarmup(storyWarmup);

    return (
      <MemoryRouter>
        <AppearanceProvider>
          <LandingRoute
            {...args}
            hasPainted={hasPainted}
          />
        </AppearanceProvider>
      </MemoryRouter>
    );
  },
};

export default meta;

export const Welcome: StoryObj<typeof LandingRoute> = {};
