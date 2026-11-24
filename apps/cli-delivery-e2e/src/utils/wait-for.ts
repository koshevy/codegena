export function waitFor(
  callback: () => Promise<void>,
  timeout: number,
  pollIntervalMs: number,
): Promise<void> {
  const deadline = Date.now() + timeout;

  return new Promise<void>((resolve, reject) => {
    const attempt = async (): Promise<void> => {
      try {
        await callback();
        resolve();
      }
      catch (cause) {
        const remainingMs = deadline - Date.now();

        if (remainingMs <= 0) {
          const error = new Error(
            `Virtual file system did not initialize within ${timeout}ms.`,
            { cause },
          );

          reject(error);
          return;
        }

        setTimeout(attempt, Math.min(pollIntervalMs, remainingMs));
      }
    };

    void attempt();
  });
}
