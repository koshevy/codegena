import { loadSpecification } from './load-specification';
import { openConversionWorker } from './open-conversion-worker';

jest.mock('./open-conversion-worker', () => ({ openConversionWorker: jest.fn() }));

const worker: Worker = {
  addEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  onerror: null,
  onmessage: null,
  onmessageerror: null,
  postMessage: jest.fn(),
  removeEventListener: jest.fn(),
  terminate: jest.fn(),
};

describe('loadSpecification', () => {
  const previousLocation = Object.getOwnPropertyDescriptor(globalThis, 'location');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(openConversionWorker).mockResolvedValue(worker);
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: new URL('https://codegena.test'),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();

    if (previousLocation) {
      Object.defineProperty(globalThis, 'location', previousLocation);
    }
    else {
      Reflect.deleteProperty(globalThis, 'location');
    }
  });

  it('terminates the worker before its pending start request completes',
    async () => {
      const started = Promise.withResolvers<void>();
      const acknowledgement = Promise.withResolvers<Response>();

      const request = jest.spyOn(globalThis, 'fetch');

      request.mockImplementation((_url, options) => {
        if (options?.method === 'POST') {
          started.resolve();

          return acknowledgement.promise;
        }

        return Promise.resolve(new Response(null, { status: 204 }));
      });

      const controller = new AbortController();
      const pending = loadSpecification('/schema.json', controller.signal, 'dev-test');
      const rejected = expect(pending).rejects.toMatchObject({ name: 'AbortError' });

      await started.promise;
      expect(openConversionWorker).toHaveBeenCalledWith(
        expect.any(String),
        controller.signal,
        'dev-test',
      );
      controller.abort();
      expect(worker.terminate).toHaveBeenCalled();
      expect(request).toHaveBeenCalledTimes(1);

      acknowledgement.resolve(new Response(null, { status: 201 }));
      await rejected;

      expect(request.mock.calls.map(([, options]) => options?.method))
        .toEqual(['POST', 'DELETE']);
    });

  it('rejects foreign URLs before creating a worker or making a request', async () => {
    const controller = new AbortController();

    const pending = loadSpecification(
      'https://foreign.test/schema.json',
      controller.signal,
      'dev-test',
    );

    await expect(pending)
      .rejects.toThrow('same-origin');
    expect(openConversionWorker).not.toHaveBeenCalled();
  });
});
