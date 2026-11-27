import { useBundleWarmup } from '@codegena/pwa/bundle-warmup';
import type { Meta, StoryFn } from '@storybook/react';

import { LandingPage } from './landing-page';
import { AppearanceProvider } from '../appearance';

const storyWarmup = {
  warmAfterPaintedGroups: [],
  extrasGroups: {},
} as const;

const meta: Meta<typeof LandingPage> = {
  component: LandingPage,
  parameters: { codegenaTheme: 'dark' },
  title: 'Codegena/Landing/Page',
};

export default meta;

export const PlaygroundToIdeology: StoryFn<typeof LandingPage> = (args) => {
  const { hasPainted } = useBundleWarmup(storyWarmup);

  return (
    <AppearanceProvider>
      <LandingPage
        {...args}
        hasPainted={hasPainted}
      />
    </AppearanceProvider>
  );
};
