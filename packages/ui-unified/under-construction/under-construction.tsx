import Alert from '@mui/material/Alert';
import { Construction } from 'lucide-react';
import { type ReactNode, useId } from 'react';

import type { UnderConstructionProps } from './under-construction.props';
import { UnderConstructionStyles } from './under-construction.styles';
import { useConstructionAcknowledgment } from './use-construction-acknowledgment';
import { GradientButton } from '../buttons';

/**
 * Presents a modal warning until the visitor acknowledges it in this tab.
 */
export function UnderConstruction({
  children,
  disclamerText,
}: UnderConstructionProps): ReactNode {
  const descriptionId = useId();
  const { acknowledge, hasAcknowledged } = useConstructionAcknowledgment();

  if (hasAcknowledged === undefined) {
    return null;
  }

  if (hasAcknowledged) {
    return children;
  }

  const renderedIcon = (
    <Construction
      aria-hidden
      size={19}
      strokeWidth={2.25}
    />
  );
  const renderedAction = (
    <GradientButton
      autoFocus
      onClick={acknowledge}
      size="small"
      variant="contained"
    >
      Got it
    </GradientButton>
  );

  return (
    <UnderConstructionStyles
      anchor="top"
      data-lenis-prevent
      open
      PaperProps={{
        'aria-describedby': descriptionId,
        'aria-label': 'Site under construction',
        'aria-modal': true,
        'role': 'alertdialog',
      }}
      variant="temporary"
    >
      <Alert
        action={renderedAction}
        icon={renderedIcon}
        role="presentation"
        severity="warning"
      >
        <span id={descriptionId}>{disclamerText}</span>
      </Alert>
    </UnderConstructionStyles>
  );
}
