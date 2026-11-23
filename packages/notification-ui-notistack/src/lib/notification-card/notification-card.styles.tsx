import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

export const notificationCardClasses = {
  root: 'NotificationCard__root',
  heading: 'NotificationCard__heading',
  content: 'NotificationCard__content',
  buttonClose: 'NotificationCard__buttonClose',
  title: 'NotificationCard__title',
  message: 'NotificationCard__message',
  actions: 'NotificationCard__actions',
};

// language=postcss
export const NotificationCardStyles = styled(Box)(({ theme }) => `
  & {
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    background: ${alpha(theme.palette.background.paper, 0.9)};
    background-blend-mode: screen, screen, lighten, overlay, lighten, difference, normal;
    border-left: 3px solid ${theme.palette.info.main};
    box-shadow: ${theme.shadows[4]};
    color: ${theme.palette.text.primary};
    min-width: 0;
    max-width: 100%;
    padding: ${theme.spacing(1.25, 1.5)};
    width: min(400px, calc(100vw - 32px));
    border-radius:
      0.1rem ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0.1rem;
    backdrop-filter: blur(2px);
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  &::before {
    z-index: -1;
    opacity: 0.05;
  }

  &::after {
    z-index: -1;
    background-color: ${theme.palette.background.paper};
    backdrop-filter: blur(4px);
    opacity: 0.5;
  }

  &[data-compact='true'] {
    box-shadow: none;
    min-width: 0;
  }

  &[data-severity='error'] {
    border-left-color: ${theme.palette.error.main};
  }

  &[data-severity='warning'] {
    border-left-color: ${theme.palette.warning.main};
  }

  &[data-severity='success'] {
    border-left-color: ${theme.palette.success.main};
  }

  &[data-severity='primary'] {
    border-left-color: ${theme.palette.primary.main};
  }

  &[data-severity='secondary'] {
    border-left-color: ${theme.palette.secondary.main};
  }

  & .${notificationCardClasses.heading} {
    align-items: center;
    color: ${theme.palette.text.secondary};
    display: flex;
    gap: 0.6rem;
  }

  & .${notificationCardClasses.heading} > svg {
    flex: none;
    align-self: start;
    margin-top: 0.3rem;
  }

  & .${notificationCardClasses.content} {
    flex: 1;
    min-width: 0;
  }

  & .${notificationCardClasses.content} {
    flex: 1;
    min-width: 0;
  }

  & .${notificationCardClasses.title} {
    color: ${theme.palette.text.primary};
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: none;
    white-space: nowrap;
    font-weight: 600;
    margin-bottom: 0.2rem;
  }

  & .MuiIconButton-root {
    flex: none;
  }

  & .${notificationCardClasses.message} {
    color: ${theme.palette.text.primary};
    max-height: 160px;
    overflow: auto;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  & .${notificationCardClasses.title} + .${notificationCardClasses.message} {
    margin-top: ${theme.spacing(0.5)};
  }

  & .${notificationCardClasses.buttonClose} {
    align-self: start;
  }

  & .${notificationCardClasses.actions} {
    border-top: 1px solid ${alpha(theme.palette.divider, 0.7)};
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing(0.5)};
    margin-top: ${theme.spacing(1)};
    padding-top: ${theme.spacing(0.75)};
  }
`);
