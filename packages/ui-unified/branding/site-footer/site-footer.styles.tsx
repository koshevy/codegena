import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const footerClasses = {
  bottom: 'Footer__bottom',
  contact: 'Footer__contact',
  navigation: 'Footer__navigation',
  policies: 'Footer__policies',
  top: 'Footer__top',
} as const;

// language=postcss
export const FooterStyles = styled(Box)(({ theme }) => `
  & {
    background: ${theme.palette.background.paper};
    border-top: 1px solid ${theme.palette.divider};
    padding: clamp(2rem, 5vw, 5rem) clamp(1.25rem, 6vw, 8rem) 2rem;
  }

  .${footerClasses.top} {
    display: grid;
    gap: 3rem;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding-bottom: 5rem;
  }

  .${footerClasses.navigation} {
    display: grid;
    gap: 0.9rem 1.5rem;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .${footerClasses.navigation} a,
  .${footerClasses.policies} a {
    color: ${theme.palette.text.primary};
    text-decoration: none;
  }

  .${footerClasses.navigation} a:hover,
  .${footerClasses.navigation} a:focus-visible,
  .${footerClasses.policies} a:hover,
  .${footerClasses.policies} a:focus-visible {
    color: ${theme.palette.info.dark};
  }

  .${footerClasses.contact} {
    align-items: flex-end;
    text-align: right;
  }

  .${footerClasses.bottom} {
    align-items: center;
    border-top: 1px solid ${theme.palette.divider};
    color: ${theme.palette.text.secondary};
    display: flex;
    font-family: monospace;
    font-size: 0.72rem;
    gap: 1.5rem;
    letter-spacing: 0.12em;
    padding-top: 2rem;
  }

  .${footerClasses.policies} {
    display: flex;
    flex-wrap: wrap;
    font-family: ${theme.typography.fontFamily};
    font-size: 0.875rem;
    gap: 0.75rem 1.5rem;
    letter-spacing: 0;
    margin-right: auto;
  }

  .${footerClasses.bottom} > span {
    white-space: nowrap;
  }

  @media (width <= 700px) {
    .${footerClasses.bottom} > span {
      display: none;
    }
  }

  @media (width <= 600px) {
    .${footerClasses.top} {
      gap: 2.5rem;
      grid-template-columns: 1fr;
      padding-bottom: 3rem;
    }

    .${footerClasses.contact} {
      align-items: flex-start;
      text-align: left;
    }

    .${footerClasses.bottom} {
      align-items: flex-start;
      flex-direction: column;
    }
  }
`);
