import type { NotificationMessage } from './notification-message';
import type { NotificationMessageId } from './notification-message-id';
import type {
  NotificationTransport,
  NotifyOptions,
} from './notification-transport';
import type { NotificationTransportType } from './notification-transport-type';

export type NotifyCombinedResult = Partial<Record<
  NotificationTransportType,
  NotificationMessageId[]
>>;

export class NotificationTransportFacade {
  constructor(private readonly transports: NotificationTransport[]) {}

  /**
   * @param closedBy
   * Optional arbitrary label to identify a reason of closing
   * @param transportType
   * Allows to filter destination of notification
   */
  close(
    closedBy?: string,
    transportType?: NotificationTransportType,
  ): void {
    this.getOfType(transportType).forEach((transport) => {
      transport.close(closedBy);
    });
  }

  /**
   * @param closedBy
   * Optional arbitrary label to identify a reason of closing
   * @param transportType
   */
  closeAll(
    closedBy?: string,
    transportType?: NotificationTransportType,
  ): void {
    this.getOfType(transportType).forEach((transport) => {
      transport.closeAll(closedBy);
    });
  }

  /**
   * @example
   * ```
   * // Using of 'ui' means this notification has only
   * // to be shown in internal UI transport, but should not
   * // be delivered to agent or backend transports.
   * transportFacade.notify(
   *   notification,
   *   options,
   *   'ui',
   * );
   * ```
   */
  notify(
    notification: NotificationMessage,
    options: NotifyOptions,
    transportType?: NotificationTransportType,
  ): NotifyCombinedResult {
    const result = this.getOfType(transportType).reduce((idsByType, transport) => {
      const itsTransportType = transport.getType();
      const id = transport.notify(notification, options);

      idsByType.set(itsTransportType, [
        ...idsByType.get(itsTransportType) ?? [],
        id,
      ]);

      return idsByType;
    }, new Map<NotificationTransportType, NotificationMessageId[]>());

    return Object.fromEntries(result);
  }

  async revoke(
    messageId: NotificationMessageId,
    transportType?: NotificationTransportType,
  ): Promise<void> {
    await Promise.all(
      this.getOfType(transportType).map(async (transport) => {
        await transport.revoke(messageId);
      }),
    );
  }

  private getOfType(type?: NotificationTransportType): NotificationTransport[] {
    if (!type) {
      return this.transports;
    }

    return this.transports.filter((transport) => transport.getType() === type);
  }
}
