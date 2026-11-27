import type { Server } from './server';

/**
 * A link from a response to another operation.
 */
export interface Link {
  operationRef?: string;
  operationId?: string;
  parameters?: Record<string, unknown>;
  requestBody?: unknown;
  description?: string;
  server?: Server;
}
