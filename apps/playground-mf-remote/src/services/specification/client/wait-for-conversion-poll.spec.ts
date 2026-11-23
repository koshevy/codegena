import { waitForConversionPoll } from './wait-for-conversion-poll';

it('clears the polling delay immediately when navigation aborts', async () => {
  jest.useFakeTimers();

  try {
    const controller = new AbortController();
    const pending = waitForConversionPoll(controller.signal);
    const rejected = expect(pending).rejects.toThrow('cancelled');

    controller.abort(new Error('Navigation cancelled.'));
    await rejected;

    expect(jest.getTimerCount()).toBe(0);
  }
  finally {
    jest.useRealTimers();
  }
});
