import { GitHubInvertocatIcon } from '@codegena/ui-unified/icons';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import type { ReactElement, Ref } from 'react';

import {
  menuContactClasses,
  MenuContactStyles,
} from './menu-contact.styles';

interface MenuContactProps {
  className?: string;
  emailRef?: Ref<HTMLAnchorElement>;
}

/**
 * Contact details shared by the navigation overlay and page footer.
 */
export function MenuContact({
  className,
  emailRef,
}: MenuContactProps): ReactElement {
  const renderedSocialLinks = (
    <Box
      aria-label="Social links"
      className={menuContactClasses.social}
      component="nav"
    >
      <IconButton
        aria-label="X"
        component="a"
        href="#"
      >
        <XIcon aria-hidden />
      </IconButton>
      <IconButton
        aria-label="GitHub"
        component="a"
        href="https://github.com/koshevy/codegena"
      >
        <GitHubInvertocatIcon />
      </IconButton>
      <IconButton
        aria-label="LinkedIn"
        component="a"
        href="#"
      >
        <LinkedInIcon aria-hidden />
      </IconButton>
    </Box>
  );

  return (
    <MenuContactStyles className={className}>
      {renderedSocialLinks}
      <Typography component="span">Alexander Koshevoy · 2018–2026</Typography>
      <Link
        href="mailto:koshevy@gmail.com"
        ref={emailRef}
      >
        koshevy@gmail.com
      </Link>
    </MenuContactStyles>
  );
}
