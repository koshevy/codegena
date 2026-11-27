import packageMetadata from '../package.json';

import { version } from './index';

describe('infr-nx package', () => {
  it('exports the version of the renamed workspace package', () => {
    expect(packageMetadata.name).toBe('@codegena/infr-nx');
    expect(version).toBe(packageMetadata.version);
  });
});
