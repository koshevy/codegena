import type { ReactNode, PropsWithChildren } from 'react';

import type { NotificationActionGrip } from './notification-action-grip';
import type { NotificationClosingReason } from './notification-closing-reason';
import type { NotificationMessage } from './notification-message';
import type { NotificationMessageId } from './notification-message-id';
import type { NotificationTransportType } from './notification-transport-type';

export interface NotifyOptions {
  onShowingAnimationComplete: () => void;
  onClosed: (reason: NotificationClosingReason) => void;
}

/**
 * These options are for {@link NotificationTransportFacade}
 */
export interface NotificationTransportOptions {
  /**
   * This means
   */
  onlyExactTransportType?: boolean;
}

export interface NotificationTransport extends NotificationActionGrip {
  /**
   * These options are for {@link NotificationTransportFacade}.
   * Recommended to implement as public readonly constructor argument.
   */
  readonly options?: NotificationTransportOptions;

  getType(): NotificationTransportType;

  notify(
    notification: NotificationMessage,
    options: NotifyOptions,
  ): NotificationMessageId;

  /**
   * Implementation of `closeAll()` has to be passed
   * with closing reason `'revoke'`.
   */
  revoke(messageId: NotificationMessageId): Promise<void>;

  /**
   * Supposed to be used as an internal wrapper allowing to inject
   * additional providers, such as `<SnackbarProvider ...></SnackbarProvider>.`
   */
  wrapChildrenToThirdPartiesProviders?(
    props: PropsWithChildren,
  ): ReactNode;
}
