import Button from '@mui/material/Button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ReactElement } from 'react';

import type { ShowHideButtonProps } from './show-hide-button.props';

export function ShowHideButton({
  hideLabel,
  isExpanded,
  onToggle,
  showLabel,
}: ShowHideButtonProps): ReactElement {
  const Icon = isExpanded ? ChevronUp : ChevronDown;
  const renderedIcon = (
    <Icon
      aria-hidden
      size={15}
    />
  );

  const label = isExpanded ? hideLabel : showLabel;

  return (
    <Button
      aria-expanded={isExpanded}
      endIcon={renderedIcon}
      onClick={onToggle}
      size="small"
    >
      {label}
    </Button>
  );
}
