import type { CompanionConnectionPorts } from '@codegena/pwa/common';
import { companionConnectionRequestSchema } from '@codegena/pwa/common';

export function readCompanionConnectionRequest(
  data: unknown,
  ports: readonly MessagePort[],
): CompanionConnectionPorts | undefined {
  const request = companionConnectionRequestSchema.safeParse(data);
  const [replyPort, companionPort] = ports;

  if (!replyPort || !companionPort || !request.success) {
    return undefined;
  }

  return { companionPort, replyPort };
}
