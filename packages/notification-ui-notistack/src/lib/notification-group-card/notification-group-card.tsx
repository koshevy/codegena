import type {
  NotificationActionGrip,
  NotificationMessage,
  NotificationMessageId,
} from '@codegena/notification-ui-core';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { ChevronDown, ChevronUp, Layers3 } from 'lucide-react';
import { useCallback, useRef, useState, type ReactElement } from 'react';

import { NotificationCard } from '../notification-card';
import {
  notificationGroupCardClasses,
  NotificationGroupCardStyles,
} from './notification-group-card.styles';
import { useNotificationGroupScroll } from './use-notification-group-scroll';

export interface NotificationGroupCardItem {
  actionGrip: NotificationActionGrip;
  id: NotificationMessageId;
  message: NotificationMessage;
  onClose: () => void;
}

export interface NotificationGroupCardProps {
  isInitiallyExpanded?: boolean;
  notifications: readonly NotificationGroupCardItem[];
  onDismissGrouped: () => void;
}

export function NotificationGroupCard({
  isInitiallyExpanded,
  notifications,
  onDismissGrouped,
}: NotificationGroupCardProps): ReactElement {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded ?? false);
  const scrollHostRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useNotificationGroupScroll(scrollHostRef, scrollViewportRef, isExpanded);

  const handleToggleExpanded = useCallback((): void => {
    setIsExpanded((value) => !value);
  }, []);

  const renderedItems = isExpanded && (
    <Box
      className={notificationGroupCardClasses.items}
      ref={scrollHostRef}
    >
      <Box
        className={notificationGroupCardClasses.itemsViewport}
        ref={scrollViewportRef}
      >
        {notifications.map(({ actionGrip, id, message, onClose }) => (
          <NotificationCard
            actionGrip={actionGrip}
            compact
            key={id}
            message={message}
            onClose={onClose}
          />
        ))}
      </Box>
    </Box>
  );

  return (
    <NotificationGroupCardStyles
      className={clsx({
        [notificationGroupCardClasses.root]: true,
        [notificationGroupCardClasses.expanded]: isExpanded,
      })}
    >
      <Box className={notificationGroupCardClasses.heading}>
        <Layers3
          aria-hidden
          size="1rem"
        />
        <Typography
          className={notificationGroupCardClasses.title}
          variant="subtitle2"
        >
          {notifications.length} more notification{notifications.length === 1 ? '' : 's'}
        </Typography>
        <Button
          aria-expanded={isExpanded}
          endIcon={isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          onClick={handleToggleExpanded}
          size="small"
        >
          {isExpanded ? 'Hide' : 'Show'}
        </Button>
      </Box>
      {renderedItems}
      <Box className={notificationGroupCardClasses.footer}>
        <Button
          onClick={onDismissGrouped}
          size="small"
        >
          Dismiss grouped
        </Button>
      </Box>
    </NotificationGroupCardStyles>
  );
}
