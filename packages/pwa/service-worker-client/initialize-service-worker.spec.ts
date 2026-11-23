import { initializeServiceWorker } from './initialize-service-worker';
import { requestServiceWorkerCompanionConnection }
  from './request-service-worker-companion-connection';

jest.mock('./request-service-worker-companion-connection');

function createWorker(buildId = 'build/2026-11-12'): ServiceWorker {
  const params = new URLSearchParams({ buildId });

  return Object.assign(new EventTarget(), {
    onerror: null,
    onstatechange: null,
    postMessage: jest.fn(),
    scriptURL: `https://codegena.example/service-worker.js?${params.toString()}`,
    state: 'activated' as const,
  });
}

describe('initializeServiceWorker', () => {
  const originalContainer = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');

  afterEach(() => {
    jest.resetAllMocks();

    if (originalContainer) {
      Object.defineProperty(navigator, 'serviceWorker', originalContainer);
    }
    else {
      Reflect.deleteProperty(navigator, 'serviceWorker');
    }
  });

  it.each(['', '   '])('rejects an empty build ID: %j', async (buildId) => {
    await expect(initializeServiceWorker(buildId))
      .rejects.toThrow('A Service Worker build ID is required.');
  });

  it('waits for the registered worker to control the page', async () => {
    const previous = createWorker();
    const replacement = createWorker();
    const registration = { active: replacement, installing: null, waiting: null };

    const container = Object.assign(new EventTarget(), {
      controller: previous,
      ready: Promise.resolve(registration),
      register: jest.fn(() => Promise.resolve(registration)),
    });

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: container,
    });

    const initialization = initializeServiceWorker('build/2026-11-12');

    await new Promise<void>((resolve) => setImmediate(resolve));

    expect(requestServiceWorkerCompanionConnection).not.toHaveBeenCalled();

    container.controller = replacement;
    container.dispatchEvent(new Event('controllerchange'));
    await initialization;

    expect(container.register).toHaveBeenCalledWith(
      '/service-worker.js?buildId=build%2F2026-11-12',
      { type: 'module', updateViaCache: 'none' },
    );
    expect(requestServiceWorkerCompanionConnection).toHaveBeenCalledWith(
      replacement,
      '/service-worker-companion.js?buildId=build%2F2026-11-12',
    );
  });

  it('rejects a registration superseded by another build before connection', async () => {
    const worker = createWorker('another-build');

    const container = Object.assign(new EventTarget(), {
      controller: worker,
      register: jest.fn(() => Promise.resolve({ active: worker })),
    });

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: container,
    });

    await expect(initializeServiceWorker('requested-build'))
      .rejects.toThrow('The PWA build was superseded during initialization.');
    expect(requestServiceWorkerCompanionConnection).not.toHaveBeenCalled();
  });

  it('keeps connection addressed to the selected worker during replacement', async () => {
    const worker = createWorker();
    const anotherWorker = createWorker('another-build');
    const registration = { active: worker };

    const container = Object.assign(new EventTarget(), {
      controller: worker,
      register: jest.fn(() => Promise.resolve(registration)),
    });

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: container,
    });

    jest.mocked(requestServiceWorkerCompanionConnection).mockImplementation(async () => {
      registration.active = anotherWorker;
      container.controller = anotherWorker;
    });

    await expect(initializeServiceWorker('build/2026-11-12'))
      .rejects.toThrow('The PWA build was superseded during initialization.');
    expect(requestServiceWorkerCompanionConnection).toHaveBeenCalledWith(
      worker,
      '/service-worker-companion.js?buildId=build%2F2026-11-12',
    );
  });
});
