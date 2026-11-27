import { NotistackNotificationProvider } from '@codegena/notification-ui-notistack';
import { PlaygroundConvertingPlaceholder }
  from '@codegena/playground-ui/converting-placeholder';
import { Playground, type PlaygroundProps } from '@codegena/playground-ui/playground';
import Alert from '@mui/material/Alert';
import type { ReactElement } from 'react';

import { useWorkerConvertedFixture } from './use-worker-converted-fixture';

interface WorkerConvertedFixtureStoryProps extends Omit<
  PlaygroundProps,
  'graph' | 'sourceSchemaText'
> {
  fixtureBaseUrl: string;
  fixtureName: string;
}

export function WorkerConvertedFixtureStory({
  fixtureBaseUrl,
  fixtureName,
  ...playgroundProps
}: WorkerConvertedFixtureStoryProps): ReactElement {
  const state = useWorkerConvertedFixture(fixtureName, fixtureBaseUrl);

  if (state.status === 'pending') {
    return <PlaygroundConvertingPlaceholder />;
  }

  if (state.status === 'error') {
    return <Alert severity="error">{state.message}</Alert>;
  }

  return (
    <Playground
      {...playgroundProps}
      graph={state.fixture.graph}
      notificationProvider={NotistackNotificationProvider}
      sourceSchemaText={state.fixture.sourceSchemaText}
    />
  );
}
