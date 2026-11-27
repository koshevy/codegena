import { getConversionChannelName } from '../conversion-channel';
import { requestHostConversion } from './request-host-conversion';

it('exchanges conversion input and output over a private channel', async () => {
  const id = crypto.randomUUID();
  const workerChannel = new BroadcastChannel(getConversionChannelName(id));
  const input = { sourceFileId: 'schema.json', sourceText: '{"type":"string"}' };
  const received = Promise.withResolvers<unknown>();

  workerChannel.onmessage = (event: MessageEvent<unknown>): void => {
    received.resolve(event.data);
    workerChannel.postMessage({ serializedGraph: '{"nodes":[],"edges":[],"logs":[]}' });
  };

  try {
    const controller = new AbortController();

    await expect(requestHostConversion(id, input, controller.signal))
      .resolves.toBe('{"nodes":[],"edges":[],"logs":[]}');
    await expect(received.promise).resolves.toEqual(input);
  }
  finally {
    workerChannel.close();
  }
});

it('releases a pending channel when the API job is cancelled', async () => {
  const controller = new AbortController();

  const pending = requestHostConversion(crypto.randomUUID(), {
    sourceFileId: 'schema.json',
    sourceText: '{}',
  }, controller.signal);

  const rejected = expect(pending).rejects.toMatchObject({ name: 'AbortError' });

  controller.abort();
  await rejected;
});
