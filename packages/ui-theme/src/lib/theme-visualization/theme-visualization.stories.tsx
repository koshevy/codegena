import type { Meta, StoryObj } from '@storybook/react';

import { ThemeVisualization } from './theme-visualization';

const meta: Meta<typeof ThemeVisualization> = {
  component: ThemeVisualization,
  title: 'Codegena/UI Theme',
};

export default meta;

export const CodegenaLightThemeOverview: StoryObj<typeof ThemeVisualization> = {};
CodegenaLightThemeOverview.storyName = 'Codegena Light Theme';

export const CodegenaDarkThemeOverview: StoryObj<typeof ThemeVisualization> = {
  parameters: { codegenaTheme: 'dark' },
};
CodegenaDarkThemeOverview.storyName = 'Codegena Dark Theme';
