import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import Box from '@mui/material/Box';
import type { ReactElement, ReactNode, Ref } from 'react';

import {
  menuAction,
  menuItems,
} from './menu-items';
import { OverlayFooter } from './overlay-footer';
import { OverlayNavigation, type OverlayNavigationItem } from './overlay-navigation';
import {
  overlayClasses,
  OverlayStyles,
} from './overlay.styles';
import { ThemeChoices } from './theme-choices';

interface OverlayProps {
  choices?: ReactNode;
  items?: readonly OverlayNavigationItem[];
  lastLinkRef?: Ref<HTMLAnchorElement>;
  navigationId: string;
  onClose: () => void;
  open: boolean;
}

const action: OverlayNavigationItem = { ...menuAction, icon: ArrowOutwardIcon };

/**
 * Full-page navigation with contact and social links.
 */
export function Overlay({
  choices,
  items = menuItems,
  lastLinkRef,
  navigationId,
  onClose,
  open,
}: OverlayProps): ReactElement {
  const renderedChoices = choices ?? <ThemeChoices onSelect={onClose} />;

  return (
    <OverlayStyles
      anchor="right"
      data-lenis-prevent
      open={open}
      SlideProps={{ appear: true }}
      variant="persistent"
    >
      <Box
        aria-label="Navigation overlay"
        className={overlayClasses.content}
        role="region"
      >
        <OverlayNavigation
          action={action}
          choices={renderedChoices}
          id={navigationId}
          items={items}
          onClose={onClose}
        />
        <OverlayFooter
          lastLinkRef={lastLinkRef}
          onClose={onClose}
        />
      </Box>
    </OverlayStyles>
  );
}
