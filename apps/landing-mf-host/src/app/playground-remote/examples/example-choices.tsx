import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactElement } from 'react';

import { ExampleChoice } from './example-choice';
import { ExampleChoicesStyles } from './example-choices.styles';
import { demoChoices, type DemoOption } from '../../playground-examples';

interface ExampleChoicesProps {
  onSelect: (choice: DemoOption) => void;
  selectedSpecUrl: string;
}

export function ExampleChoices({
  onSelect,
  selectedSpecUrl,
}: ExampleChoicesProps): ReactElement {
  const renderedChoices = demoChoices.map((choice) => (
    <ExampleChoice
      choice={choice}
      isSelected={choice.specUrl === selectedSpecUrl}
      key={choice.specUrl}
      onSelect={onSelect}
    />
  ));

  return (
    <ExampleChoicesStyles>
      <Typography component="h2">Examples</Typography>
      <Box
        aria-label="Examples"
        role="group"
      >
        {renderedChoices}
      </Box>
    </ExampleChoicesStyles>
  );
}
