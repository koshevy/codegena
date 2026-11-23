import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const overlayNavigationClasses = {
  actions: 'OverlayNavigation__actions',
  choices: 'OverlayNavigation__choices',
  primary: 'OverlayNavigation__primary',
  right: 'OverlayNavigation__right',
} as const;

// language=postcss
export const OverlayNavigationStyles = styled(Box, {
  shouldForwardProp: (property) => (
    property !== 'primaryItemCount' && property !== 'actionItemCount'
  ),
})<{ actionItemCount: number; primaryItemCount: number }>(({
  actionItemCount,
  primaryItemCount,
}) => `
  & {
    display: grid;
    flex: 1;
    gap: 1.25rem 3rem;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: repeat(${primaryItemCount}, minmax(max-content, 1fr));
    padding: 3rem 0;
  }

  .${overlayNavigationClasses.primary} {
    align-items: flex-start;
    display: grid;
    grid-row: 1 / -1;
    grid-template-rows: subgrid;
    justify-items: start;
  }

  .${overlayNavigationClasses.right} {
    display: grid;
    grid-row: 1 / -1;
    grid-template-rows: subgrid;
  }

  .${overlayNavigationClasses.choices} {
    grid-row: 1 / span ${primaryItemCount - actionItemCount};
  }

  .${overlayNavigationClasses.actions} {
    align-items: flex-start;
    display: grid;
    grid-row: -${actionItemCount + 1} / -1;
    grid-template-rows: subgrid;
    justify-items: start;
  }

  @media (max-width: 900px) {
    & {
      grid-template-columns: 1fr;
      grid-template-rows: none;
      padding: 0;
      row-gap: 3rem;
    }

    .${overlayNavigationClasses.primary} {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      justify-content: space-between;
      padding: 4rem 0 2rem;
    }

    .${overlayNavigationClasses.choices} {
      display: contents;
      grid-row: auto;
    }
    .${overlayNavigationClasses.right} { display: contents; }
  }
`);
