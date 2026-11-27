import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// language=postcss
export const PanelBodyStyles = styled(Box)`
  & {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
`;
