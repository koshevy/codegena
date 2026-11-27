const namedImportPattern = /^(import(?: type)? \{) ([^{}]+) (\} from ['"][^'"]+['"];?)$/;

/**
 * Prettier leaves a single named import on one line even when it exceeds
 * printWidth. Wrap that generated form, including its module path when needed,
 * after formatting the full file.
 */
export function wrapLongImportDeclarations(
  sourceText: string,
  printWidth: number,
): string {
  return sourceText.split('\n').map((line) => {
    if (line.length <= printWidth) {
      return line;
    }

    const match = line.match(namedImportPattern);

    if (!match) {
      return line;
    }

    const [, start, specifier, end] = match;
    const importEnding = end.length > printWidth
      ? end.replace(' from ', ' from\n  ')
      : end;

    return `${start}\n  ${specifier},\n${importEnding}`;
  }).join('\n');
}
