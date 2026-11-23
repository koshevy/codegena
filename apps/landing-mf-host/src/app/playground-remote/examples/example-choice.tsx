import type { ReactElement } from 'react';
import { useCallback } from 'react';

import { ExampleChoiceStyles } from './example-choice.styles';
import type { DemoOption } from '../../playground-examples';

interface ExampleChoiceProps {
  choice: DemoOption;
  isSelected: boolean;
  onSelect: (choice: DemoOption) => void;
}

export function ExampleChoice({
  choice,
  isSelected,
  onSelect,
}: ExampleChoiceProps): ReactElement {
  const handleSelect = useCallback((): void => {
    onSelect(choice);
  }, [
    choice,
    onSelect,
  ]);

  const Icon = choice.icon;

  return (
    <ExampleChoiceStyles
      aria-pressed={isSelected}
      disabled={isSelected}
      onClick={handleSelect}
      startIcon={<Icon aria-hidden />}
    >
      {choice.label}
    </ExampleChoiceStyles>
  );
}
