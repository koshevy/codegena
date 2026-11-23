import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// language=postcss
export const ScrollMouseStyles = styled(Box)`
  & {
    display: inline-flex;
    flex: none;
  }

  & path {
    animation: scrollMouseWheel 2.8s ease-in-out infinite;
  }

  @keyframes scrollMouseWheel {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(3px); }
  }

  @media (prefers-reduced-motion: reduce) {
    & path { animation: none; }
  }
`;
