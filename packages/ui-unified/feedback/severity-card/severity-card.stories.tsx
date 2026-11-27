import { en, Faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/react';

import { SeverityLabel } from '../severity-label';
import { SeverityCard } from './severity-card';

function createStoryFaker(): Faker {
  const storyFaker = new Faker({ locale: [en] });

  storyFaker.seed(441);

  return storyFaker;
}

const faker = createStoryFaker();

const longMessage = Array.from({ length: 8 }, () => (
  faker.commerce.productDescription()
)).join('\n\n');

const meta: Meta<typeof SeverityCard> = {
  args: {
    ariaLabel: 'Warning at schema.jsonc:1526:21',
    heading: (
      <SeverityLabel
        label="schema.jsonc:1526:21"
        severity="warning"
      />
    ),
    message: 'The generated type uses a fallback for this schema property.',
    severity: 'warning',
  },
  component: SeverityCard,
  title: 'Codegena/Unified UI/Feedback/Severity Card',
};

export default meta;

export const Warning: StoryObj<typeof SeverityCard> = {};

export const LongMessage: StoryObj<typeof SeverityCard> = {
  args: { message: longMessage },
};

export const Error: StoryObj<typeof SeverityCard> = {
  args: {
    ariaLabel: 'Error at schema.jsonc:1526:21',
    heading: (
      <SeverityLabel
        label="schema.jsonc:1526:21"
        severity="error"
      />
    ),
    severity: 'error',
  },
};

export const Dark: StoryObj<typeof SeverityCard> = {
  parameters: { codegenaTheme: 'dark' },
};
