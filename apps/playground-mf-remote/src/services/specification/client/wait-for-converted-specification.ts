import { waitForConversionPoll } from './wait-for-conversion-poll';

export async function waitForConvertedSpecification(
  url: string,
  signal: AbortSignal,
): Promise<unknown> {
  for (;;) {
    signal.throwIfAborted();

    const response = await fetch(url, { signal });

    if (response.status === 202) {
      await waitForConversionPoll(signal);
      continue;
    }

    if (!response.ok) {
      throw new Error(`Specification conversion failed (${response.status}).`);
    }

    return response.json();
  }
}
