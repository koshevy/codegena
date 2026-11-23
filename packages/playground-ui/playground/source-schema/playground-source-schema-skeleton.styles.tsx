import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// language=postcss
export const PlaygroundSourceSchemaSkeletonStyles = styled(Box)(({ theme }) => `
  & {
    background: ${theme.palette.background.paper};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing(0.25)};
    inset: 0;
    overflow: hidden;
    padding: ${theme.spacing(1.5, 1)};
    position: absolute;
    z-index: 1;
  }

  & .PlaygroundSourceSchemaSkeleton__line {
    align-items: center;
    display: grid;
    gap: ${theme.spacing(1.25)};
    grid-template-columns: 2.5rem minmax(0, 1fr);
    min-height: 1.25rem;
  }

  & .PlaygroundSourceSchemaSkeleton__lineNumber {
    color: ${theme.palette.text.disabled};
    font-family: 'JetBrains Mono', monospace;
    font-size: ${theme.typography.caption.fontSize};
    text-align: right;
  }

  & .MuiSkeleton-root {
    border-radius: ${theme.shape.borderRadius}px;
    height: 0.85rem;
    transform: none;
  }
`);
