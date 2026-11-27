import Button from '@mui/material/Button';
import type { ReactElement } from 'react';

import { demoChoices, getPlaygroundPath } from '../playground-examples';
import {
  demoButtonClasses,
  DemoButtonStyles,
} from './unified-ui/demo-button.styles';
import {
  unifiedUiIllustrationClasses,
  UnifiedUiIllustrationStyles,
} from './unified-ui/unified-ui-illustration.styles';

export function FeatureOverviewExamples({ search }: { search: string }): ReactElement {
  const renderedChoices = demoChoices.map(({ icon: Icon, label, specUrl }) => (
    <DemoButtonStyles key={specUrl}>
      <Button
        className={demoButtonClasses.button}
        href={`${getPlaygroundPath(specUrl)}${search}`}
        startIcon={<Icon aria-hidden />}
        variant="contained"
      >
        {label}
      </Button>
    </DemoButtonStyles>
  ));

  return (
    <UnifiedUiIllustrationStyles>
      <div className={unifiedUiIllustrationClasses.list}>
        <h3 className={unifiedUiIllustrationClasses.heading}>Select example:</h3>
        {renderedChoices}
      </div>
    </UnifiedUiIllustrationStyles>
  );
}
