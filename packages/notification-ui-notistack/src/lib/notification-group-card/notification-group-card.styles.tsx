import Box from '@mui/material/Box';
import { alpha, emphasize, styled } from '@mui/material/styles';

import { notificationCardClasses } from '../notification-card';

export const notificationGroupCardClasses = {
  root: 'NotificationGroupCard__root',
  heading: 'NotificationGroupCard__heading',
  title: 'NotificationGroupCard__title',
  items: 'NotificationGroupCard__items',
  itemsViewport: 'NotificationGroupCard__itemsViewport',
  footer: 'NotificationGroupCard__footer',
  expanded: 'NotificationGroupCard__expanded',
};

// language=postcss
export const NotificationGroupCardStyles = styled(Box)(({ theme }) => `
  & {
    box-sizing: border-box;
    box-shadow: ${theme.shadows[4]};
    color: ${theme.palette.text.primary};
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
    width: min(400px, calc(100vw - 32px));
    backdrop-filter: blur(4px);
    border-radius:
      0.1rem ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0.1rem;
  }

  &.${notificationGroupCardClasses.expanded} {
    background-color:
      ${alpha(emphasize(theme.palette.background.paper, 0.5), 0.2)};
  }

  & .${notificationGroupCardClasses.heading},
  & .${notificationGroupCardClasses.footer} {
    background: ${theme.palette.background.paper};
    border-left: 3px solid ${theme.palette.info.main};
    padding: ${theme.spacing(1.25, 1.5)};
    backdrop-filter: blur(6px);
  }

  & .${notificationGroupCardClasses.heading} {
    align-items: center;
    display: flex;
    gap: 0.4rem;
  }

  & .${notificationGroupCardClasses.title} {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: ${theme.typography.button.fontSize};
  }

  & .${notificationGroupCardClasses.items} {
    box-sizing: border-box;
    margin: ${theme.spacing(1, 0)};
    max-height: min(45vh, 320px);
    min-width: 0;
    position: relative;
    width: 100%;
  }

  & .${notificationGroupCardClasses.itemsViewport} {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing(0.75)};
    max-height: min(45vh, 320px);
    min-width: 0;
    overflow: hidden auto;
    width: 100%;
  }

  & .${notificationGroupCardClasses.itemsViewport} .${notificationCardClasses.root} {
    border-radius: 0;
    box-sizing: border-box;
    flex: none;
    max-width: 100%;
    min-width: 0;
    width: 100%;
  }

  & .os-scrollbar.os-theme-codegena {
    --os-padding-perpendicular: 0;
    --os-track-border-radius: 0;
    --os-handle-border-radius: 0;
    --os-handle-bg: ${alpha(theme.palette.text.primary, 0.34)};
    --os-handle-bg-hover: ${alpha(theme.palette.text.primary, 0.54)};
    --os-handle-bg-active: ${theme.palette.primary.main};
    --os-handle-interactive-area-offset: 3px;
  }

  & .os-scrollbar.os-theme-codegena .os-scrollbar-track {
    box-shadow: inset 0 0 0 1px ${alpha(theme.palette.text.disabled, 0.1)};
  }

  & .os-scrollbar-vertical.os-theme-codegena {
    --os-size: 7px;
  }

  & .os-scrollbar-horizontal.os-theme-codegena {
    --os-size: 6px;
  }
`);
