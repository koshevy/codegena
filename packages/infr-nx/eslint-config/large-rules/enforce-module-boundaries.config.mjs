import { depConstraints } from './global-nx-tags.mjs';

export default {
  '@nx/enforce-module-boundaries': [
    'error',
    {
      allow: [
        String.raw`^.*/eslint(\.base)?\.config\.[cm]?[jt]s$`,
        String.raw`^.*/jest\.config\.[cm]?[jt]s$`,
        // ESLint configs and others
        '^@codegena/infr-nx.*$',
      ],
      allowCircularSelfDependency: true,
      banTransitiveDependencies: true,
      checkNestedExternalImports: true,
      depConstraints,
      enforceBuildableLibDependency: true,
    },
  ],
};
