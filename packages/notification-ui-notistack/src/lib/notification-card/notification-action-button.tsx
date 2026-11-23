import type {
  NotificationActionGrip,
  NotificationMessageAction,
} from '@codegena/notification-ui-core';
import Button from '@mui/material/Button';
import { type ReactElement, useCallback } from 'react';

interface NotificationActionButtonProps {
  action: NotificationMessageAction;
  actionGrip: NotificationActionGrip;
  onClose: () => void;
}

export function NotificationActionButton({
  action,
  actionGrip,
  onClose,
}: NotificationActionButtonProps): ReactElement {
  const handleClick = useCallback((): void => {
    if (action.onClick?.(actionGrip) === 'close') {
      onClose();
    }
  }, [
    action,
    actionGrip,
    onClose,
  ]);

  return (
    <Button
      color={action.severity ?? 'primary'}
      onClick={handleClick}
      size="small"
      startIcon={action.icon}
    >
      {action.title}
    </Button>
  );
}
