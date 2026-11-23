import type { ReactElement } from 'react';

import {
  peelDrawerClasses,
  PeelDrawerStyles,
} from './peel-drawer.styles';

interface PeelDrawerProps {
  ariaLabel: string;
  contentRef: (element: HTMLDivElement | null) => void;
  onClose: () => void;
  open: boolean;
}

/**
 * Shows a mobile illustration above the page in its expanded state.
 */
export function PeelDrawer({
  ariaLabel,
  contentRef,
  onClose,
  open,
}: PeelDrawerProps): ReactElement {
  return (
    <PeelDrawerStyles
      anchor="bottom"
      ModalProps={{
        disableAutoFocus: true,
        disableRestoreFocus: true,
      }}
      onClose={onClose}
      open={open}
      PaperProps={{
        'aria-label': ariaLabel,
        'role': 'dialog',
      }}
      slotProps={{
        backdrop: {
          onTouchMove: onClose,
          onWheel: onClose,
        },
      }}
      transitionDuration={0}
    >
      <div
        className={peelDrawerClasses.content}
        ref={contentRef}
      />
    </PeelDrawerStyles>
  );
}
