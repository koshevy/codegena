import { readCompanionConnectionRequest } from './read-companion-connection-request';

describe('readCompanionConnectionRequest', () => {
  it('returns the reply and companion ports to its caller', () => {
    const reply = new MessageChannel();
    const companion = new MessageChannel();

    try {
      const connection = readCompanionConnectionRequest({
        type: 'codegena:pwa:connect-companion',
      }, [reply.port1, companion.port1]);

      expect(connection).toEqual({
        companionPort: companion.port1,
        replyPort: reply.port1,
      });
    }
    finally {
      reply.port1.close();
      reply.port2.close();
      companion.port1.close();
      companion.port2.close();
    }
  });

  it.each([
    null,
    { type: 'another-message' },
    { type: 'codegena:pwa:connect-companion', extra: true },
  ])('ignores messages outside the connection contract: %j', (data) => {
    const reply = new MessageChannel();
    const companion = new MessageChannel();

    try {
      expect(readCompanionConnectionRequest(data, [
        reply.port1,
        companion.port1,
      ])).toBeUndefined();
    }
    finally {
      reply.port1.close();
      reply.port2.close();
      companion.port1.close();
      companion.port2.close();
    }
  });

  it('ignores a connection request without both transfer ports', () => {
    const reply = new MessageChannel();

    try {
      expect(readCompanionConnectionRequest({
        type: 'codegena:pwa:connect-companion',
      }, [reply.port1])).toBeUndefined();
    }
    finally {
      reply.port1.close();
      reply.port2.close();
    }
  });
});
