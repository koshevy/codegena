import type { NotificationMessage } from '@codegena/notification-ui-core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import {
  NotificationGroupCard,
  type NotificationGroupCardItem,
} from './notification-group-card';

const messages: NotificationMessage[] = [
  {
    fallbackMessage: 'The schema was converted successfully.',
    severity: 'success',
    title: 'Types generated',
  },
  {
    fallbackMessage: 'An unsupported constraint was skipped.',
    severity: 'warning',
    title: 'Review generated types',
  },
  {
    fallbackMessage: 'The source contains an unresolved reference.',
    severity: 'error',
    title: 'Reference unresolved',
  },
  {
    fallbackMessage: 'The generated files are ready to inspect.',
    severity: 'info',
    title: 'Output ready',
  },
];

const notifications = messages.map((message, index) => ({
  actionGrip: { close: fn(), closeAll: fn() },
  id: `grouped-notification-${index + 1}`,
  message,
  onClose: fn(),
}));

const overflowingNotifications: NotificationGroupCardItem[] = Array.from(
  { length: 12 },
  (_, index) => ({
    actionGrip: { close: fn(), closeAll: fn() },
    id: `overflowing-notification-${index + 1}`,
    message: {
      fallbackMessage: `Generated declaration ${index + 1} needs review.`,
      severity: index % 2 === 0 ? 'warning' : 'info',
      title: `Declaration ${index + 1}`,
    },
    onClose: fn(),
  }),
);

const meta: Meta<typeof NotificationGroupCard> = {
  argTypes: { notifications: { control: false } },
  component: NotificationGroupCard,
  title: 'Codegena/Notifications/NotificationGroupCard',
};

export default meta;

export const LightTheme: StoryObj<typeof NotificationGroupCard> = {
  args: { notifications, onDismissGrouped: fn() },
};

export const DarkTheme: StoryObj<typeof NotificationGroupCard> = {
  args: { notifications, onDismissGrouped: fn() },
  parameters: { codegenaTheme: 'dark' },
};

export const LightThemeInitiallyExpanded: StoryObj<typeof NotificationGroupCard> = {
  args: {
    isInitiallyExpanded: true,
    notifications,
    onDismissGrouped: fn(),
  },
};

export const OverflowingGroup: StoryObj<typeof NotificationGroupCard> = {
  args: {
    isInitiallyExpanded: true,
    notifications: overflowingNotifications,
    onDismissGrouped: fn(),
  },
};
