import { NotistackNotificationProvider } from '@codegena/notification-ui-notistack';
import { Playground } from '@codegena/playground-ui/playground';
import type { ReactElement } from 'react';

import type { ConvertedSpecification } from '../../services/specification';

export interface SpecificationPlaygroundProps {
  onSandwichButtonClick?: () => void;
  specification: ConvertedSpecification;
}

export function SpecificationPlayground({
  onSandwichButtonClick,
  specification,
}: SpecificationPlaygroundProps): ReactElement {
  return (
    <Playground
      graph={specification.graph}
      notificationProvider={NotistackNotificationProvider}
      onSandwichButtonClick={onSandwichButtonClick}
      sourceSchemaText={specification.sourceSchemaText}
    />
  );
}
