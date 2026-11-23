import { handleCompanionRequest } from './handle-companion-request';
import { loadModuleImplementation } from './load-module-implementation';

jest.mock('./load-module-implementation');

const origin = 'https://codegena.example';
const loadImplementation = jest.mocked(loadModuleImplementation);

describe('handleCompanionRequest', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns the implementation result from plain request data', async () => {
    const implementation = jest.fn(() => Promise.resolve(42));

    loadImplementation.mockResolvedValue(implementation);

    const result = await handleCompanionRequest({
      moduleUrl: '/modules/add.js',
      params: [17, 25],
    }, origin);

    expect(result).toBe(42);
    expect(loadImplementation).toHaveBeenCalledWith(`${origin}/modules/add.js`);
    expect(implementation).toHaveBeenCalledWith(17, 25);
  });

  it('rejects a foreign module before loading it', async () => {
    await expect(handleCompanionRequest({
      moduleUrl: 'https://other.example/add.js',
      params: [17, 25],
    }, origin)).rejects.toThrow('A same-origin URL is required.');

    expect(loadImplementation).not.toHaveBeenCalled();
  });

  it('propagates an execution error to its caller', async () => {
    const error = new Error('The implementation failed.');
    const implementation = jest.fn(() => Promise.reject(error));

    loadImplementation.mockResolvedValue(implementation);

    await expect(handleCompanionRequest({
      moduleUrl: '/modules/add.js',
      params: [],
    }, origin)).rejects.toBe(error);
  });
});
