import type {
  NotificationActionGrip,
  NotificationClosingReason,
  NotificationMessage,
  NotificationMessageId,
  NotificationTransport,
  NotificationTransportType,
  NotifyOptions,
} from '@codegena/notification-ui-core';
import type { CloseReason, ProviderContext } from 'notistack';

import { createNotificationMessageKey } from './create-notification-message-key';
import { NotificationCard } from './notification-card';
import { NotificationGroupCardContainer } from './notification-group-card';

export interface ActiveNotification {
  id: NotificationMessageId;
  isShown: boolean;
  messageKey: string;
  message: NotificationMessage;
  options: NotifyOptions[];
}

export class NotistackNotificationTransport implements NotificationTransport {
  private readonly visible = new Map<NotificationMessageId, ActiveNotification>();
  private readonly grouped = new Map<NotificationMessageId, ActiveNotification>();
  private readonly activeByMessageKey = new Map<string, ActiveNotification>();
  private readonly closingReasons = new Map<
    NotificationMessageId,
    NotificationClosingReason
  >();

  private readonly listeners = new Set<() => void>();
  private groupedSnapshot: readonly ActiveNotification[] = [];
  private groupSnackbarId: string | undefined;
  private groupShown = false;
  private nextNotificationId = 0;

  constructor(
    private readonly snackbar: ProviderContext,
    private readonly maxVisible: number,
  ) {}

  getType(): NotificationTransportType {
    return 'ui';
  }

  notify(message: NotificationMessage, options: NotifyOptions): NotificationMessageId {
    const messageKey = createNotificationMessageKey(message);
    const duplicate = this.activeByMessageKey.get(messageKey);

    if (duplicate) {
      duplicate.options.push(options);

      if (duplicate.isShown) {
        options.onShowingAnimationComplete();
      }

      return duplicate.id;
    }

    const id = this.createNotificationId();
    const notification: ActiveNotification = {
      id,
      isShown: false,
      messageKey,
      message,
      options: [options],
    };

    this.activeByMessageKey.set(messageKey, notification);

    if (this.grouped.size > 0 || this.visible.size >= this.maxVisible - 1) {
      this.grouped.set(id, notification);
      this.publishGrouped();
      this.showGroup();

      if (this.groupShown) {
        this.markAsShown(notification);
      }

      return id;
    }

    this.visible.set(id, notification);

    const actionGrip = this.getActionGrip(id);
    const { close: handleCardClose } = actionGrip;

    this.snackbar.enqueueSnackbar({
      autoHideDuration: message.autoHideDuration,
      key: id,
      message: (
        <NotificationCard
          actionGrip={actionGrip}
          message={message}
          onClose={handleCardClose}
        />
      ),
      onClose: (_event, reason) => this.handleVisibleClose(id, reason),
      onEntered: () => this.markAsShown(notification),
    });

    return id;
  }

  close(): void {
    const [groupedId] = this.grouped.keys();
    const [visibleId] = this.visible.keys();
    const id = groupedId ?? visibleId;

    if (id) {
      this.closeById(id, 'dismiss');
    }
  }

  closeAll(): void {
    this.closeGrouped('revoke');

    this.visible.forEach(({ id }) => {
      this.closeById(id, 'revoke');
    });
  }

  async revoke(id: NotificationMessageId): Promise<void> {
    this.closeById(id, 'revoke');
  }

  closeGrouped(reason: NotificationClosingReason = 'dismiss'): void {
    const notifications = [...this.grouped.values()];

    this.grouped.clear();
    this.publishGrouped();
    this.closeGroupSnackbar();

    notifications.forEach((notification) => {
      this.releaseNotification(notification);
      this.notifyClosed(notification, reason);
    });
  }

  getActionGrip(id: NotificationMessageId): NotificationActionGrip {
    return {
      close: () => this.closeById(id, 'dismiss'),
      closeAll: () => this.closeAll(),
    };
  }

  getGroupedSnapshot = (): readonly ActiveNotification[] => this.groupedSnapshot;

  subscribeToGrouped = (listener: () => void): (() => void) => {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  };

  private showGroup(): void {
    if (this.groupSnackbarId) {
      return;
    }

    const id = this.createGroupId();

    this.groupSnackbarId = id;
    this.snackbar.enqueueSnackbar({
      key: id,
      // NotistackContent renders this message as the group's custom card.
      message: <NotificationGroupCardContainer transport={this} />,
      onClose: () => this.handleGroupClose(id),
      onEntered: () => {
        if (this.groupSnackbarId !== id) {
          return;
        }

        this.groupShown = true;
        this.grouped.forEach((notification) => this.markAsShown(notification));
      },
      persist: true,
    });
  }

  private closeById(id: NotificationMessageId, reason: NotificationClosingReason): void {
    const groupedNotification = this.grouped.get(id);

    if (groupedNotification) {
      this.grouped.delete(id);
      this.releaseNotification(groupedNotification);
      this.notifyClosed(groupedNotification, reason);
      this.publishGrouped();

      if (this.grouped.size > 0) {
        return;
      }

      this.closeGroupSnackbar();

      return;
    }

    if (!this.visible.has(id) || this.closingReasons.has(id)) {
      return;
    }

    this.closingReasons.set(id, reason);
    this.releaseNotification(this.visible.get(id));
    this.snackbar.closeSnackbar(id);
  }

  private handleVisibleClose(
    id: NotificationMessageId,
    notistackReason: CloseReason,
  ): void {
    const notification = this.visible.get(id);

    if (!notification) {
      return;
    }

    // fixme: Has to be reviewed later. Skip for this time.
    const reason = this.closingReasons.get(id)
      ?? (notistackReason === 'timeout' ? 'timeout' : 'revoke');

    this.visible.delete(id);
    this.closingReasons.delete(id);
    this.releaseNotification(notification);
    this.notifyClosed(notification, reason);
  }

  private createNotificationId(): NotificationMessageId {
    this.nextNotificationId += 1;

    return `codegena-notification-${this.nextNotificationId}`;
  }

  private createGroupId(): string {
    return `${this.createNotificationId()}-group`;
  }

  private closeGroupSnackbar(): void {
    const id = this.groupSnackbarId;

    if (!id) {
      return;
    }

    this.groupSnackbarId = undefined;
    this.groupShown = false;
    this.snackbar.closeSnackbar(id);
  }

  private handleGroupClose(id: string): void {
    if (this.groupSnackbarId !== id) {
      return;
    }

    this.groupSnackbarId = undefined;
    this.groupShown = false;
    this.closeGrouped('dismiss');
  }

  private releaseNotification(notification: ActiveNotification | undefined): void {
    if (!notification) {
      return;
    }

    if (this.activeByMessageKey.get(notification.messageKey) === notification) {
      this.activeByMessageKey.delete(notification.messageKey);
    }
  }

  private markAsShown(notification: ActiveNotification): void {
    if (notification.isShown) {
      return;
    }

    notification.isShown = true;
    notification.options.forEach((options) => options.onShowingAnimationComplete());
  }

  private notifyClosed(
    notification: ActiveNotification,
    reason: NotificationClosingReason,
  ): void {
    notification.options.forEach((options) => options.onClosed(reason));
  }

  private publishGrouped(): void {
    this.groupedSnapshot = [...this.grouped.values()];
    this.listeners.forEach((listener) => listener());
  }
}
