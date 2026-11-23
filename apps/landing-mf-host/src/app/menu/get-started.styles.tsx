import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';

import { HostLink } from '../navigation';

// language=postcss
export const GetStartedStyles = styled(Button<typeof HostLink>)(({ theme }) => `
  & {
    border-color: ${alpha(theme.palette.info.dark, 0.5)};
    border-radius: 2px;
    color: ${theme.palette.text.primary};
    flex-shrink: 0;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    margin-left: 1rem;
    padding: 0.55rem 1.2rem;
    text-transform: uppercase;
  }

  &:hover {
    border-color: ${theme.palette.info.dark};
  }

  @media (max-width: 1000px) {
    & { display: none; }
  }
`);
