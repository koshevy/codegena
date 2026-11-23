import { styled } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';

// language=postcss
export const PanelHeaderToolbarItemStyles = styled(ToggleButton)(() => `
  & > span {
    align-content: center;
    align-items: center;
    display: flex;
  }
`);
