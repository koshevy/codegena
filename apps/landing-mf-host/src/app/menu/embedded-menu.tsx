import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { ArrowLeft } from 'lucide-react';
import { type ReactElement, type ReactNode, Suspense, useId, useMemo } from 'react';

import { LazyOverlay } from './lazy-overlay';
import { menuItems } from './menu-items';
import type { OverlayNavigationItem } from './overlay-navigation';
import { Toggle } from './toggle';

interface EmbeddedMenuProps {
  choices: ReactNode;
  onClose: () => void;
  onReturn: () => void;
  open: boolean;
}

const embeddedLinks = menuItems.filter(({ label }) => (
  ['Docs', 'Roadmap and status', 'Blog', 'GitHub'].includes(label)
));

export function EmbeddedMenu({
  choices,
  onClose,
  onReturn,
  open,
}: EmbeddedMenuProps): ReactElement {
  const navigationId = useId();

  const items = useMemo<OverlayNavigationItem[]>(() => [
    { href: '#', icon: ArrowLeft, label: 'Return to landing', onSelect: onReturn },
    ...embeddedLinks,
  ], [onReturn]);

  return (
    <Modal
      hideBackdrop
      onClose={onClose}
      open={open}
    >
      <Box
        aria-label="Playground navigation"
        aria-modal="true"
        data-lenis-prevent
        role="dialog"
        tabIndex={-1}
      >
        <Toggle
          isOpen
          navigationId={navigationId}
          onClick={onClose}
        />
        <Suspense fallback={null}>
          <LazyOverlay
            choices={choices}
            items={items}
            navigationId={navigationId}
            onClose={onClose}
            open={open}
          />
        </Suspense>
      </Box>
    </Modal>
  );
}
