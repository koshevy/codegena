import { GradientButton } from '@codegena/ui-unified/buttons';
import { styled } from '@mui/material/styles';

import { HostLink } from '../navigation';

// language=postcss
export const GetStartedStyles = styled(GradientButton<typeof HostLink>)`
  & {
    flex-shrink: 0;
    margin-left: 1rem;
  }

  @media (max-width: 1000px) {
    & { display: none; }
  }
`;
