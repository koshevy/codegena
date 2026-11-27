import 'cli-testing-library/jest';

// eslint-disable-next-line no-restricted-imports -- Load this project's Jest utilities.
import * as virtualFs from './src/utils';

const {
  checkIsVirtualFsInitialized,
  prepareVirtualFs,
  shootDownVirtualFs,
  skipShootDownVirtualFs,
  waitFor,
} = virtualFs;
const fsCreatingTimeout = 60_000;

beforeAll(async () => {
  await prepareVirtualFs();
  await waitFor(checkIsVirtualFsInitialized, fsCreatingTimeout, 1000);
}, 600_000);

afterAll(async () => {
  if (skipShootDownVirtualFs) return;

  await shootDownVirtualFs();
});
