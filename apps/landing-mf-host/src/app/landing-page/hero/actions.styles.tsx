import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// language=postcss
export const ActionsStyles = styled(Box)`
  & {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.8rem;
    justify-content: center;
    margin-top: 2.6rem;
  }

  /* Keep the second action in place when its label becomes "See more". */
  & > .MuiButton-outlined {
    min-inline-size: 11.5rem;
  }

  @media (max-height: 800px) {
    & {
      margin-top: 1.5rem;
    }
  }

  @media (max-width: 520px) {
    & {
      margin-top: 1.5rem;
    }
  }

  @media (max-width: 520px) and (max-height: 700px) {
    & {
      margin-top: 1rem;
    }
  }
`;
