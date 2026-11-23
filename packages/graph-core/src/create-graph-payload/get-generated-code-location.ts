/**
 * Find a declaration's one-based line and zero-based column in generated code.
 * Return no location when its snippet is absent or cannot be found.
 */
export function getGeneratedCodeLocation(
  text: string,
  keySnippet?: string,
): { line: number; col: number } | undefined {
  if (!keySnippet) {
    return undefined;
  }

  const lines = text.split('\n');
  const lineIndex = lines.findIndex((line) => {
    const col = line.indexOf(keySnippet);

    if (col === -1) {
      return false;
    }

    const nextCharacter = line.at(col + keySnippet.length);

    return line.slice(0, col).trim().length === 0
      && (nextCharacter === undefined || /[\s<={.]/.test(nextCharacter));
  });

  if (lineIndex === -1) {
    return undefined;
  }

  return {
    line: lineIndex + 1,
    col: lines[lineIndex].indexOf(keySnippet),
  };
}
