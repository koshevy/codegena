import { convertFixtureToGraph } from '@codegena/graph-core/testing-utils';
import { NotistackNotificationProvider } from '@codegena/notification-ui-notistack';
import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement, ReactNode } from 'react';
import { fn } from 'storybook/test';

import { Playground } from './playground';
import { WorkerConvertedFixtureStory } from '../.storybook/story-utils';

function LimitedNotificationProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <NotistackNotificationProvider maxVisible={2}>
      {children}
    </NotistackNotificationProvider>
  );
}

const meta: Meta<typeof Playground> = {
  args: { persistenceKey: null },
  component: Playground,
  render: (args, { loaded }) => (
    <Playground
      {...args}
      graph={loaded['graph']}
      notificationProvider={NotistackNotificationProvider}
      sourceSchemaText={loaded['sourceSchemaText']}
    />
  ),
  title: 'Codegena/Playground',
};

export default meta;

export const Light: StoryObj<typeof Playground> = {
  args: { defaultThemeMode: 'light' },
  loaders: () => convertFixtureToGraph('account.schema.jsonc'),
};

export const Dark: StoryObj<typeof Playground> = {
  args: { defaultThemeMode: 'dark' },
  parameters: { codegenaTheme: 'dark' },
  loaders: () => convertFixtureToGraph('account.schema.jsonc'),
};

export const Graph: StoryObj<typeof Playground> = {
  args: { defaultGeneratedView: 'graph' },
  loaders: () => convertFixtureToGraph('account.schema.jsonc'),
};

export const SourceHidden: StoryObj<typeof Playground> = {
  args: { defaultSourceOpen: false },
  loaders: () => convertFixtureToGraph('account.schema.jsonc'),
};

export const Comprehensive: StoryObj<typeof Playground> = {
  loaders: () => convertFixtureToGraph('comprehensive.jsonc'),
};

export const DirectoryHierarchy: StoryObj<typeof Playground> = {
  loaders: () => convertFixtureToGraph('oas3-onepassword-connect.json'),
};

export const ComprehensiveWithNotificationOverflow: StoryObj<typeof Playground> = {
  loaders: () => convertFixtureToGraph('comprehensive.jsonc'),
  render: (args, { loaded }) => (
    <Playground
      {...args}
      graph={loaded['graph']}
      notificationProvider={LimitedNotificationProvider}
      sourceSchemaText={loaded['sourceSchemaText']}
    />
  ),
};

export const WarningWithoutDeclaration: StoryObj<typeof Playground> = {
  loaders: () => convertFixtureToGraph(
    'account-with-warning.schema.jsonc',
  ),
};

export const ComprehensiveWithPersistence: StoryObj<typeof Playground> = {
  args: {
    persistenceKey: 'codegena.playground.story.comprehensive.v1',
  },
  loaders: () => convertFixtureToGraph('comprehensive.jsonc'),
};

export const OnePasswordConnectWithPersistence: StoryObj<typeof Playground> = {
  args: {
    persistenceKey: 'codegena.playground.story.onepassword-connect.v1',
  },
  loaders: () => convertFixtureToGraph('oas3-onepassword-connect.json'),
  name: '1Password Connect with Persistence',
};

export const GitHubRestApiWithPersistence: StoryObj<typeof Playground> = {
  args: {
    persistenceKey: 'codegena.playground.story.github-rest-api.v1',
  },
  name: 'GitHub REST API with Persistence',
  render: (args) => (
    <WorkerConvertedFixtureStory
      {...args}
      fixtureBaseUrl="/visitor-fixtures"
      fixtureName="oas3-api-github-com.json"
    />
  ),
};

export const AccountConvertedInWorker: StoryObj<typeof Playground> = {
  name: 'Account converted in worker',
  render: (args) => (
    <WorkerConvertedFixtureStory
      {...args}
      fixtureBaseUrl="/fixtures"
      fixtureName="account.schema.jsonc"
    />
  ),
};

export const PersistentLayout: StoryObj<typeof Playground> = {
  args: { persistenceKey: 'codegena.playground.story.persistence.v1' },
  loaders: () => convertFixtureToGraph('account.schema.jsonc'),
};

export const HostNavigation: StoryObj<typeof Playground> = {
  args: { onSandwichButtonClick: fn() },
  loaders: () => convertFixtureToGraph('account.schema.jsonc'),
};
