import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import ts from 'typescript';

const relativeSpecifier = /^\.{1,2}(?:\/|$)/;
const publicIndexFile = /^index\.(?:d\.)?[cm]?[jt]sx?$/;
const compilerOptions = { moduleResolution: ts.ModuleResolutionKind.Bundler };

const moduleSpecifiers = [
  ':matches(ImportDeclaration, ImportExpression, TSImportType) > .source',
  ':matches(ExportNamedDeclaration, ExportAllDeclaration) > .source',
  'TSExternalModuleReference > .expression',
  'CallExpression[callee.name="require"] > .arguments:first-child',
].join(', ');

function readSpecifier(source) {
  const pending = [source];
  let specifier = '';

  while (pending.length > 0) {
    const part = pending.pop();

    if (part.type === 'BinaryExpression' && part.operator === '+') {
      pending.push(part.right, part.left);
      continue;
    }

    const isTemplate = part.type === 'TemplateLiteral';
    const text = isTemplate ? part.quasis[0].value.cooked : part.value;

    if (typeof text !== 'string') {
      return { isComplete: false, specifier };
    }

    specifier += text;

    if (isTemplate && part.expressions.length > 0) {
      return { isComplete: false, specifier };
    }
  }

  return { isComplete: true, specifier };
}

export const featureImportBoundaries = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      privateFile: 'Import "{{specifier}}" through its feature entry point (index).',
    },
  },
  create(context) {
    const filename = context.physicalFilename;
    const directory = dirname(filename);

    function checkSpecifier(source) {
      const { isComplete, specifier } = readSpecifier(source);

      if (!relativeSpecifier.test(specifier)) {
        return;
      }

      const resolvedFile = isComplete
        ? ts.resolveModuleName(specifier, filename, compilerOptions, ts.sys)
          .resolvedModule?.resolvedFileName
        : undefined;

      if (resolvedFile && publicIndexFile.test(basename(resolvedFile))) {
        return;
      }

      const target = resolvedFile ?? resolve(directory, specifier);
      const relativeTarget = relative(directory, target);
      const isOutside = relativeTarget === '..'
        || relativeTarget.startsWith(`..${sep}`)
        || isAbsolute(relativeTarget);

      if (isOutside) {
        context.report({ node: source, messageId: 'privateFile', data: { specifier } });
      }
    }

    return { [moduleSpecifiers]: checkSpecifier };
  },
};
