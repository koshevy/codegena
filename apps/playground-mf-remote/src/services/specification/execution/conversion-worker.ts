/// <reference lib="webworker" />

import {
  conversionWorkerStartSchema,
  getConversionChannelName,
} from '../conversion-channel';
import { convertWorkerInput } from './convert-worker-input';

function startConversionWorker(event: MessageEvent<unknown>): void {
  const { id } = conversionWorkerStartSchema.parse(event.data);
  const channel = new BroadcastChannel(getConversionChannelName(id));

  channel.onmessage = (message: MessageEvent<unknown>): void => {
    void convertWorkerInput(message.data).then((result) => {
      channel.postMessage(result);
      channel.close();
    });
  };

  globalThis.postMessage({ ready: true });
}

globalThis.addEventListener('message', startConversionWorker, { once: true });
