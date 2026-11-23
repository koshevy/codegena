import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// language=postcss
export const CodegenaGraphViewSkeletonStyles = styled(Box)(({ theme }) => `
  & {
    align-items: center;
    display: flex;
    gap: ${theme.spacing(3)};
    inset: 0;
    justify-content: center;
    overflow: hidden;
    padding: ${theme.spacing(3)};
    position: absolute;
  }

  & .MuiSkeleton-root {
    border-radius: ${theme.shape.borderRadius * 2}px;
    flex: 0 0 auto;
  }
`);
