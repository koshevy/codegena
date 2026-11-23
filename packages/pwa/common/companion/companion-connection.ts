import { z } from 'zod';

export const companionConnectionRequestType = 'codegena:pwa:connect-companion';

/**
 * A page asks the active Service Worker to attach its SharedWorker companion.
 * Transfer ports accompany this data: reply port first, companion port second.
 */
export const companionConnectionRequestSchema = z.strictObject({
  type: z.literal(companionConnectionRequestType),
});

export type CompanionConnectionRequest = z.infer<
  typeof companionConnectionRequestSchema
>;

/**
 * Confirms the Service Worker attached the port, before any feature is executed.
 */
export const companionConnectionResponseSchema = z.strictObject({
  connected: z.literal(true),
});

export type CompanionConnectionResponse = z.infer<
  typeof companionConnectionResponseSchema
>;

export interface CompanionConnectionPorts {
  companionPort: MessagePort;
  replyPort: MessagePort;
}

/**
 * Live connection owned by the central Service Worker's message listener.
 * A new connection replaces its port; a worker restart clears it.
 */
export interface ServiceWorkerCompanionConnection {
  port?: MessagePort;
}
