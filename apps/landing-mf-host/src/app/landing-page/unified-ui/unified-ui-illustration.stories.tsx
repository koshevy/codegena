import type { Meta, StoryObj } from '@storybook/react';
import { motionValue } from 'motion/react';
import { fn } from 'storybook/test';

import { UnifiedUiIllustration } from './unified-ui-illustration';

const meta: Meta<typeof UnifiedUiIllustration> = {
  args: {
    isZooming: false,
    labelOpacity: motionValue(1),
    onSelect: fn(),
  },
  component: UnifiedUiIllustration,
  parameters: { codegenaTheme: 'dark' },
  title: 'Codegena/Landing/Unified UI illustration',
};

export default meta;

export const ChooseDemo: StoryObj<typeof UnifiedUiIllustration> = {};
