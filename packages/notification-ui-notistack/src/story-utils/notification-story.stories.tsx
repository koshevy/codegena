import type { Meta, StoryObj } from '@storybook/react-vite';

import { NotificationStory } from './notification-story';
import { NotistackNotificationProvider } from '../lib/notistack-notification-provider';

const meta: Meta<typeof NotificationStory> = {
  args: { scenario: 'severities' },
  component: NotificationStory,
  decorators: [(Story) => (
    <NotistackNotificationProvider>
      <Story />
    </NotistackNotificationProvider>
  )],
  title: 'Codegena/Notifications/Notistack',
};

export default meta;

export const Severities: StoryObj<typeof NotificationStory> = {};

export const Titleless: StoryObj<typeof NotificationStory> = {
  args: { scenario: 'titleless' },
};

export const Actions: StoryObj<typeof NotificationStory> = {
  args: { scenario: 'actions' },
};

export const OverflowGrouping: StoryObj<typeof NotificationStory> = {
  args: { scenario: 'overflow' },
};

export const DarkTheme: StoryObj<typeof NotificationStory> = {
  args: { scenario: 'severities' },
  parameters: { codegenaTheme: 'dark' },
};
