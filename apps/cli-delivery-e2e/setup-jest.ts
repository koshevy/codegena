import { updateAllMonoreposVersionsInPackageJson } from '@codegena/infr-nx/utils';
import { writeJson } from 'fs-extra';
import { glob, readFile } from 'node:fs/promises';
import { join } from 'node:path';

// eslint-disable-next-line no-restricted-imports -- Load the local prerelease helper.
import { getNextWorkspaceVersion } from './src/utils';

/** Give built libraries an E2E prerelease before publishing them to Verdaccio. */
async function imitateVersionBumpForLibraries(): Promise<void> {
  const bumpedVersion = await getNextWorkspaceVersion();
  const builtPackageJsonGlob = glob(join(__dirname, '../../dist/*/package.json'));

  for await (const packageJsonPath of builtPackageJsonGlob) {
    const packageJsonContent = updateAllMonoreposVersionsInPackageJson(
      await readFile(packageJsonPath, 'utf8'),
      bumpedVersion,
    );

    if (!packageJsonContent) {
      throw new Error(`Unable to parse JSON file: ${packageJsonPath}`);
    }

    const packageJson: unknown = JSON.parse(packageJsonContent);

    if (!packageJson || typeof packageJson !== 'object' || Array.isArray(packageJson)) {
      throw new Error(`Invalid package manifest at ${packageJsonPath}.`);
    }

    Object.assign(packageJson, { version: bumpedVersion });
    await writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }
}

export default async function setupJest(): Promise<void> {
  await imitateVersionBumpForLibraries();
}
