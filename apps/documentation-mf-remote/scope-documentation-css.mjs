import selectorParser from 'postcss-selector-parser';

import { documentationRootClassName } from './documentation-root-class.mjs';

const scopeDocumentSelectors = selectorParser((selectors) => {
  selectors.walkTags((node) => {
    if (node.value === 'html') {
      node.replaceWith(selectorParser.pseudo({ value: ':scope' }));
    }
  });

  selectors.walkPseudos((node) => {
    if (node.value === ':root') {
      node.value = ':scope';
    }
  });
});

function scopeDocumentRule(rule) {
  if (rule.selector.includes('html') || rule.selector.includes(':root')) {
    // Inside @scope, target the document root explicitly with :scope.
    rule.selector = scopeDocumentSelectors.processSync(rule.selector);
  }
}

/**
 * Keep loaded documentation CSS inactive after the host leaves docs or blog.
 * Imports and named assets remain global; visual rules follow the owned wrapper.
 */
function wrapDocumentationCss(root, { AtRule }) {
  const scope = new AtRule({
    name: 'scope',
    // An attribute selector stays global when css-loader processes CSS Modules.
    params: `(html:has([class~="${documentationRootClassName}"]))`,
  });

  root.walkRules(scopeDocumentRule);

  root.each((node) => {
    const isGlobalAsset = node.type === 'atrule'
      && ['charset', 'import', 'font-face', 'keyframes', '-webkit-keyframes']
        .includes(node.name);

    if (!isGlobalAsset) {
      scope.append(node);
    }
  });

  root.append(scope);
}

export const scopeDocumentationCss = {
  postcssPlugin: 'codegena-documentation-scope',
  Once: wrapDocumentationCss,
};
