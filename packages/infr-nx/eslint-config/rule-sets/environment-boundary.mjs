import globals from 'globals';

const builtInGlobals = new Set([
  ...Object.keys(globals.builtin),
  ...Object.keys(globals.browser),
  ...Object.keys(globals.node),
]);

const globalHolders = new Set(['window', 'self', 'global', 'globalThis']);
const processModule = /^(?:node:)?process$/;

const environmentModule = /(?:^|\/)environment(?:\.[cm]?[jt]sx?)?$/;
const runtimeSource = /\/(?:apps|packages)\/[^/]+\/(?:src\/|\.storybook\/)/;
const startupSource = /\/(?:main|bootstrap)\.[cm]?[jt]sx?$/;
const storybookStartup = /\/\.storybook\/preview\.[cm]?[jt]sx?$/;
const testSource = /\.(?:spec|test)\.[cm]?[jt]sx?$/;
const buildSource = /\/[^/]+\.config\.[cm]?[jt]s$/;
const storybookBuild = /\/\.storybook\/(?:main|browser-services-plugin)\.[cm]?[jt]s$/;

function isExternalReference(reference) {
  const variable = reference?.resolved;

  return !variable || variable.defs.length === 0
    || variable.defs.some((definition) => definition.parent?.declare);
}

function getPropertyName(node) {
  const property = node.property ?? node.key;

  return node.computed ? property?.value : property?.name ?? property?.value;
}

function isProcessImport(definition) {
  return definition.type === 'ImportBinding'
    && processModule.test(definition.parent.source.value)
    && (definition.node.type !== 'ImportSpecifier'
      || definition.node.imported.name === 'default');
}

/** Keep app configuration reads and imports at their declared owners. */
export const environmentBoundary = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      read: 'Read runtime configuration in environment.ts and export prepared values.',
      import: 'Import environment.ts only at startup; pass values explicitly.',
    },
  },
  create(context) {
    const filename = context.filename.replaceAll('\\', '/');

    if (!runtimeSource.test(filename)
      || testSource.test(filename) || buildSource.test(filename)
      || storybookBuild.test(filename)) {
      return {};
    }

    const isEnvironment = environmentModule.test(filename);
    const isStartup = startupSource.test(filename) || storybookStartup.test(filename);

    function reportRead(node) {
      if (!isEnvironment) {
        context.report({ node, messageId: 'read' });
      }
    }

    function checkEnvironmentImport(node) {
      const source = node.source ?? node.arguments?.[0];

      if (!isStartup && typeof source?.value === 'string'
        && environmentModule.test(source.value)) {
        context.report({ node, messageId: 'import' });
      }
    }

    function findReference(identifier) {
      return context.sourceCode.getScope(identifier).references.find((reference) => (
        reference.identifier === identifier
      ));
    }

    function isGlobalHolder(node) {
      return node.type === 'Identifier' && globalHolders.has(node.name)
        && isExternalReference(findReference(node));
    }

    function isProcessObject(node) {
      if (node.type === 'MemberExpression') {
        return getPropertyName(node) === 'process' && isGlobalHolder(node.object);
      }

      if (node.type !== 'Identifier') {
        return false;
      }

      const reference = findReference(node);
      const isImportedProcess = reference?.resolved?.defs.some((definition) => (
        isProcessImport(definition)
      ));

      return isImportedProcess
        || (node.name === 'process' && isExternalReference(reference));
    }

    function isRestrictedProperty(object, name) {
      const isEnvironmentRead = name === 'env'
        && (isProcessObject(object) || object.type === 'MetaProperty');
      const isCustomGlobal = typeof name === 'string'
        && !builtInGlobals.has(name) && isGlobalHolder(object);

      return isEnvironmentRead || isCustomGlobal;
    }

    function checkMemberRead(node) {
      const isWrite = node.parent.type === 'AssignmentExpression'
        && node.parent.left === node && node.parent.operator === '=';

      if (!isWrite && isRestrictedProperty(node.object, getPropertyName(node))) {
        reportRead(node);
      }
    }

    function checkDestructuredRead(node) {
      if (node.id.type !== 'ObjectPattern' || !node.init) {
        return;
      }

      node.id.properties.forEach((property) => {
        if (isRestrictedProperty(node.init, getPropertyName(property))) {
          reportRead(property);
        }
      });
    }

    function checkImport(node) {
      checkEnvironmentImport(node);

      if (processModule.test(node.source.value)) {
        node.specifiers.forEach((specifier) => {
          if (specifier.imported?.name === 'env') {
            reportRead(specifier);
          }
        });
      }
    }

    function checkGlobalReference(reference) {
      const isCustomGlobal = isExternalReference(reference)
        && !builtInGlobals.has(reference.identifier.name);

      if (isCustomGlobal && reference.isValueReference !== false
        && reference.isRead()) {
        reportRead(reference.identifier);
      }
    }

    function checkGlobalReads() {
      context.sourceCode.scopeManager.scopes.forEach((scope) => {
        scope.references.forEach((reference) => checkGlobalReference(reference));
      });
    }

    return {
      'Program:exit': checkGlobalReads,
      'MemberExpression': checkMemberRead,
      'VariableDeclarator': checkDestructuredRead,
      'ImportDeclaration': checkImport,
      'ExportNamedDeclaration': checkEnvironmentImport,
      'ExportAllDeclaration': checkEnvironmentImport,
      'CallExpression[callee.name="require"]': checkEnvironmentImport,
    };
  },
};
