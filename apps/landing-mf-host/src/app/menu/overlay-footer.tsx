import { CodegenaContact, CodegenaWordmark } from '@codegena/ui-unified/branding';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import type { ReactElement, Ref } from 'react';

import { policyItems } from './menu-items';
import {
  overlayFooterClasses,
  OverlayFooterStyles,
} from './overlay-footer.styles';
import { HostLink } from '../navigation';

interface OverlayFooterProps {
  lastLinkRef?: Ref<HTMLAnchorElement>;
  onClose: () => void;
}

export function OverlayFooter({
  lastLinkRef,
  onClose,
}: OverlayFooterProps): ReactElement {
  const renderedPolicyLinks = policyItems.map(({ href, label }) => (
    <Link
      component={HostLink}
      href={href}
      key={label}
      onClick={onClose}
    >
      {label}
    </Link>
  ));

  return (
    <OverlayFooterStyles>
      <CodegenaWordmark className={overlayFooterClasses.brand} />
      <Box
        aria-label="Navigation contact"
        className={overlayFooterClasses.contact}
        component="footer"
        role="group"
      >
        <nav
          aria-label="Policies"
          className={overlayFooterClasses.policies}
        >
          {renderedPolicyLinks}
        </nav>
        <CodegenaContact emailRef={lastLinkRef} />
      </Box>
    </OverlayFooterStyles>
  );
}
