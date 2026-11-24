import yargsParser from 'yargs-parser';

import type { ExpectedCustomCliParams } from './expected-custom-cli-params';

export function getCustomCliParams(): ExpectedCustomCliParams {
  const args = yargsParser(process.argv.slice(2));
  const dontSkipTestsForWindows: unknown = args['dontSkipTestsForWindows'];
  const skipShootDownVirtualFs: unknown = args['skipShootDownVirtualFs'];

  return {
    dontSkipTestsForWindows: dontSkipTestsForWindows === 'true',
    skipShootDownVirtualFs: skipShootDownVirtualFs === true
      || skipShootDownVirtualFs === 'true',
  };
}
