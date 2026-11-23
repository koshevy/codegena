import type {
  NotificationActionGrip,
  NotificationMessage,
  NotificationSeverity,
} from '@codegena/notification-ui-core';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import {
  Bell,
  CircleAlert,
  CircleCheck,
  Info,
  Sparkles,
  X,
} from 'lucide-react';
import { type ReactElement, useMemo } from 'react';

import { NotificationActionButton } from './notification-action-button';
import {
  notificationCardClasses,
  NotificationCardStyles,
} from './notification-card.styles';

export interface NotificationCardProps {
  actionGrip: NotificationActionGrip;
  compact?: boolean;
  message: NotificationMessage;
  onClose: () => void;
}

function getSeverityIcon(severity: NotificationSeverity): ReactElement {
  switch (severity) {
    case 'error':
    case 'warning':
      return (
        <CircleAlert
          aria-hidden
          size={17}
        />
      );
    case 'success':
      return (
        <CircleCheck
          aria-hidden
          size={17}
        />
      );
    case 'primary':
      return (
        <Bell
          aria-hidden
          size={17}
        />
      );
    case 'secondary':
      return (
        <Sparkles
          aria-hidden
          size={17}
        />
      );
    default:
      return (
        <Info
          aria-hidden
          size={17}
        />
      );
  }
}

export function NotificationCard({
  actionGrip,
  compact = false,
  message,
  onClose,
}: NotificationCardProps): ReactElement {
  const severity = message.severity ?? 'info';
  const keyedActions = useMemo(() => message.actions?.map((action) => ({
    action,
    id: crypto.randomUUID(),
  })), [message.actions]);

  const renderedTitle = message.title && (
    <Typography
      className={notificationCardClasses.title}
      variant="subtitle2"
    >
      {message.title}
    </Typography>
  );

  const renderedActions = keyedActions && keyedActions.length > 0 && (
    <Box className={notificationCardClasses.actions}>
      {keyedActions.map(({ action, id }) => (
        <NotificationActionButton
          action={action}
          actionGrip={actionGrip}
          key={id}
          onClose={onClose}
        />
      ))}
    </Box>
  );

  return (
    <NotificationCardStyles
      className={notificationCardClasses.root}
      data-compact={compact}
      data-severity={severity}
    >
      <Box className={notificationCardClasses.heading}>
        {getSeverityIcon(severity)}
        <Box className={notificationCardClasses.content}>
          {renderedTitle}
          <Typography
            className={notificationCardClasses.message}
            variant="body2"
          >
            {message.message ?? message.fallbackMessage}
          </Typography>
        </Box>
        <IconButton
          aria-label="Dismiss notification"
          className={notificationCardClasses.buttonClose}
          onClick={onClose}
          size="small"
        >
          <X
            aria-hidden
            size={16}
          />
        </IconButton>
      </Box>
      {renderedActions}
    </NotificationCardStyles>
  );
}
