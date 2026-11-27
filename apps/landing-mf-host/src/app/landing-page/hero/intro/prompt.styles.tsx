import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

export const promptClasses = {
  actions: 'Prompt__actions',
  heading: 'Prompt__heading',
  input: 'Prompt__input',
} as const;

// language=postcss
export const PromptStyles = styled(Paper)(({ theme }) => `
  & {
    background-color: ${theme.palette.background.paper};
    border: 1px solid ${theme.palette.divider};
    border-radius: ${theme.shape.borderRadius}px;
    padding: 0.75rem;
    text-align: left;
    width: 100%;
  }

  .${promptClasses.heading} {
    align-items: center;
    color: ${theme.palette.secondary.dark};
    display: flex;
    font-size: 0.72rem;
    font-weight: 600;
    gap: 0.5rem;
    letter-spacing: 0.11em;
    margin: 0;
    text-transform: uppercase;
  }

  .${promptClasses.input} {
    color: ${theme.palette.text.primary};
    font-size: 0.94rem;
    line-height: 1.6;
    margin: 0.9rem 0;
    width: 100%;
  }

  .${promptClasses.input} .MuiInputBase-input {
    padding: 0;
  }

  .${promptClasses.actions} {
    align-items: center;
    border-top: 1px solid ${theme.palette.divider};
    display: flex;
    justify-content: flex-end;
    padding-top: 0.5rem;
  }
`);
