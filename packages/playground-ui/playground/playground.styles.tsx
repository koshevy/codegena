import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

export const playgroundClasses = {
  root: 'Playground__root',
  body: 'Playground__body',
  source: 'Playground__source',
  sourceHidden: 'Playground__sourceHidden',
  generated: 'Playground__generated',
  details: 'Playground__details',
  detailsHidden: 'Playground__detailsHidden',
  separator: 'Playground__separator',
};

// language=postcss
export const PlaygroundStyles = styled(Box)(({ theme }) => `
  & {
    background: ${theme.palette.background.default};
    color: ${theme.palette.text.primary};
    display: flex;
    flex-direction: column;
    height: 100vh;
    min-height: 540px;
    overflow: hidden;
    position: relative;
    width: 100%;
    user-select: none;
  }

  & .${playgroundClasses.body} {
    flex: 1;
    min-height: 0;
  }

  & .${playgroundClasses.source},
  & .${playgroundClasses.generated},
  & .${playgroundClasses.details} {
    background: ${theme.palette.background.paper};
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    min-width: 0;
  }

  & .${playgroundClasses.source}.${playgroundClasses.sourceHidden},
  & .${playgroundClasses.details}.${playgroundClasses.detailsHidden} {
    visibility: hidden;
  }

  & .${playgroundClasses.generated} {
    position: relative;
    background:
      radial-gradient(
        ellipse 60% 45% at 16% 16%,
        ${alpha(theme.palette.primary.main, 0.11)},
        transparent 100%
      ),
      radial-gradient(
        ellipse 58% 52% at 88% 82%,
        ${alpha(theme.palette.secondary.main, 0.09)},
        transparent 100%
      ),
      linear-gradient(
        145deg,
        ${theme.palette.background.paper},
        ${theme.palette.background.default} 55%,
        ${theme.palette.background.paper}
      );
  }

  & .${playgroundClasses.source}:not(.${playgroundClasses.sourceHidden}) {
    border-right: 1px solid ${theme.palette.divider};
  }

  & .${playgroundClasses.details}:not(.${playgroundClasses.detailsHidden}) {
    border-left: 1px solid ${theme.palette.divider};
  }

  & .${playgroundClasses.separator} {
    background: ${theme.palette.background.paper};
    flex: 0 0 2px;
    position: relative;
    transition: background 150ms ease;
  }

  & .${playgroundClasses.separator}::before {
    content: '';
    inset: 0 -1px;
    position: absolute;
  }

  & .${playgroundClasses.separator}:hover,
  & .${playgroundClasses.separator}[data-separator='active'],
  & .${playgroundClasses.separator}[data-separator='focus'] {
    &::before {
      background: ${theme.palette.primary.light};
      z-index: 3;
    }
  }
`);
