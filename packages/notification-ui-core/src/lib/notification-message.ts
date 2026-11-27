import { ReactNode } from 'react';

import { NotificationActionGrip } from './notification-action-grip';
import { NotificationSeverity } from './notification-severitry';

export interface NotificationMessageAction {
  icon?: ReactNode;
  severity?: NotificationSeverity;
  onClick?: (actionApi: NotificationActionGrip) => void | 'close';
  title: string;
}

export interface NotificationMessage {
  actions?: NotificationMessageAction[];
  autoHideDuration?: number;
  /**
   * Required part which allows to delivery message
   * in any type of transport, not only React- and UI-based.
   * For example, it can be used for VSC notifications when
   * some components used in VS Code.
   */
  fallbackMessage: string;
  /**
   * Rich formated part of message. Optional.
   */
  message?: ReactNode;
  title?: string;
  severity?: NotificationSeverity;
}

export interface NotificationMessageActionWithId extends NotificationMessageAction {
  /**
   * Automatically generated ID
   */
  readonly id: string;
}
