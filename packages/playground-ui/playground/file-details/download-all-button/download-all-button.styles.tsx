import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

// language=postcss
export const DownloadAllButtonStyles = styled(IconButton)(() => `
  & .DownloadAllButton__spinner {
    animation: download-all-spin 900ms linear infinite;
  }

  @keyframes download-all-spin {
    to { transform: rotate(360deg); }
  }
`);
