import { en, Faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { NotificationCard } from './notification-card';

function createStoryFaker(): Faker {
  const storyFaker = new Faker({ locale: [en] });

  storyFaker.seed(441);

  return storyFaker;
}

const faker = createStoryFaker();

const meta: Meta<typeof NotificationCard> = {
  component: NotificationCard,
  title: 'Codegena/Notifications/NotificationCard',
};

export default meta;

export const PrimaryLight: StoryObj<typeof NotificationCard> = {
  args: {
    message: {
      fallbackMessage: faker.commerce.productDescription(),
      severity: 'primary',
      title: faker.commerce.productName(),
    },
  },
};

export const PrimaryDark: StoryObj<typeof NotificationCard> = {
  parameters: { codegenaTheme: 'dark' },
  args: {
    message: {
      fallbackMessage: faker.commerce.productDescription(),
      severity: 'primary',
      title: faker.commerce.productName(),
    },
  },
};

export const PrimaryLightWithoutTitle: StoryObj<typeof NotificationCard> = {
  args: {
    message: {
      fallbackMessage: faker.commerce.productDescription(),
      severity: 'primary',
    },
  },
};

export const PrimaryLightWithoutTitleShort: StoryObj<typeof NotificationCard> = {
  args: {
    message: {
      fallbackMessage: faker.commerce.productName(),
      severity: 'primary',
    },
  },
};

export const PrimaryLightWithOneAction: StoryObj<typeof NotificationCard> = {
  args: {
    message: {
      actions: [
        {
          title: 'Neutral action',
        },
      ],
      fallbackMessage: faker.commerce.productDescription(),
      severity: 'primary',
      title: faker.commerce.productName(),
    },
  },
};

export const PrimaryLightWithActions: StoryObj<typeof NotificationCard> = {
  args: {
    message: {
      actions: [
        {
          title: 'Neutral action',
        },
        {
          severity: 'error',
          title: 'Danger action',
        },
        {
          severity: 'warning',
          title: 'Warning action',
        },
        {
          severity: 'success',
          title: 'Successful action',
        },
      ],
      fallbackMessage: faker.commerce.productDescription(),
      severity: 'primary',
      title: faker.commerce.productName(),
    },
  },
};

export const SecondaryLight: StoryObj<typeof NotificationCard> = {
  args: {
    message: {
      fallbackMessage: faker.commerce.productDescription(),
      severity: 'secondary',
      title: faker.commerce.productName(),
    },
  },
};

export const SecondaryDark: StoryObj<typeof NotificationCard> = {
  parameters: { codegenaTheme: 'dark' },
  args: {
    message: {
      fallbackMessage: faker.commerce.productDescription(),
      severity: 'secondary',
      title: faker.commerce.productName(),
    },
  },
};

export const SuccessfulLight: StoryObj<typeof NotificationCard> = {
  args: {
    message: {
      fallbackMessage: faker.commerce.productDescription(),
      severity: 'success',
      title: faker.commerce.productName(),
    },
  },
};

export const SuccessfulDark: StoryObj<typeof NotificationCard> = {
  parameters: { codegenaTheme: 'dark' },
  args: {
    message: {
      fallbackMessage: faker.commerce.productDescription(),
      severity: 'success',
      title: faker.commerce.productName(),
    },
  },
};

export const WarningLight: StoryObj<typeof NotificationCard> = {
  args: {
    message: {
      fallbackMessage: faker.commerce.productDescription(),
      severity: 'warning',
      title: faker.commerce.productName(),
    },
  },
};

export const WarningDark: StoryObj<typeof NotificationCard> = {
  parameters: { codegenaTheme: 'dark' },
  args: {
    message: {
      fallbackMessage: faker.commerce.productDescription(),
      severity: 'warning',
      title: faker.commerce.productName(),
    },
  },
};

export const ErrorLight: StoryObj<typeof NotificationCard> = {
  args: {
    message: {
      fallbackMessage: faker.commerce.productDescription(),
      severity: 'error',
      title: faker.commerce.productName(),
    },
  },
};

export const ErrorDark: StoryObj<typeof NotificationCard> = {
  parameters: { codegenaTheme: 'dark' },
  args: {
    message: {
      fallbackMessage: faker.commerce.productDescription(),
      severity: 'error',
      title: faker.commerce.productName(),
    },
  },
};
