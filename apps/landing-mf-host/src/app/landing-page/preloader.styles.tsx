import Alert from '@mui/material/Alert';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';

// language=postcss
export const PreloaderLine = styled(LinearProgress)(({ theme }) => `
  & {
    height: 3px;
    inset: 0 0 auto;
    pointer-events: none;
    position: fixed;
    z-index: ${theme.zIndex.appBar};
  }

  @media (prefers-reduced-motion: reduce) {
    .${linearProgressClasses.bar1Indeterminate} {
      animation: none;
      left: 31%;
      right: auto;
      width: 38%;
    }

    .${linearProgressClasses.bar2Indeterminate} {
      display: none;
    }
  }
`);

// language=postcss
export const SlowConnectionAlert = styled(Alert)(({ theme }) => `
  & {
    background-color: ${theme.palette.warning.main};
    color: ${theme.palette.warning.contrastText};
    font-weight: 400;
  }
`);
