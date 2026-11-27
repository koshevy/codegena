import type { ThemeConfig } from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';

import { configureDocumentationRspack } from './rspack.config.mjs';
import { scopeDocumentationCss } from './scope-documentation-css.mjs';

const config: Config = {
  title: 'Codegena',
  tagline: 'OpenAPI and JSON Schema code generation',
  url: 'https://codegena.org',
  baseUrl: '/',
  organizationName: 'koshevy',
  projectName: 'codegena',
  onBrokenLinks: 'throw',
  future: {
    faster: true,
    v4: {
      fasterByDefault: true,
      mdx1CompatDisabledByDefault: true,
      removeLegacyPostBuildHeadAttribute: true,
      siteStorageNamespacing: true,
      // Flattened cascade layers add ID specificity that overrides runtime MUI styles.
      useCssCascadeLayers: false,
    },
  },
  storage: { type: 'localStorage', namespace: 'codegena-documentation' },
  presets: [
    ['classic', {
      docs: {
        routeBasePath: '/',
        sidebarPath: './sidebars.ts',
      },
      blog: {
        blogTitle: 'Blog',
        blogDescription: 'Codegena development notes',
        showReadingTime: true,
      },
    }],
  ],
  plugins: [
    (context) => ({
      name: 'codegena-documentation-federation',
      configurePostCss: (options) => {
        options.plugins.push(scopeDocumentationCss);

        return options;
      },
      configureWebpack: (_config, isServer, { currentBundler }) => (
        configureDocumentationRspack(_config, isServer, context.siteDir, currentBundler)
      ),
    }),
  ],
  themeConfig: {
    colorMode: { defaultMode: 'dark', respectPrefersColorScheme: true },
    navbar: {
      title: 'Codegena',
      items: [
        {
          to: '/',
          label: 'Docs',
          position: 'left',
          activeBaseRegex: '^/(?!(blog|roadmap-and-status|about|contacts)(/|$))',
        },
        { to: '/roadmap-and-status', label: 'Roadmap and status', position: 'left' },
        { to: '/blog', label: 'Blog', position: 'left' },
        { to: '/about', label: 'About', position: 'left' },
        { to: '/contacts', label: 'Contacts', position: 'left' },
        { type: 'custom-playground', position: 'left' },
      ],
    },
    footer: {},
  } satisfies ThemeConfig,
};

export default config;
