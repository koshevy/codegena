import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

export const codegenaGraphViewHeaderClasses = {
  root: 'CodegenaGraphView__header',
  brand: 'CodegenaGraphView__brand',
  title: 'CodegenaGraphView__title',
  legend: 'CodegenaGraphView__legend',
};

// language=postcss
export const CodegenaGraphViewHeaderStyles = styled(Stack)(({ theme }) => `
  & {
    align-items: center;
    border-bottom: 1px solid ${theme.palette.divider};
    flex-flow: row wrap;
    gap: ${theme.spacing(2, 3)};
    justify-content: space-between;
    padding: ${theme.spacing(3)};
  }

  .${codegenaGraphViewHeaderClasses.brand} {
    color: ${theme.palette.secondary.main};
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.4px;
  }

  .${codegenaGraphViewHeaderClasses.title} {
    font-weight: 700;
  }

  .${codegenaGraphViewHeaderClasses.legend} {
    align-items: center;
    flex-flow: row wrap;
    gap: ${theme.spacing(1)};
  }
`);
