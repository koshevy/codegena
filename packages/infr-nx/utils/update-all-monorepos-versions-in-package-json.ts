export function updateAllMonoreposVersionsInPackageJson(
  content: string | null,
  actualVersion: string,
): string | null {
  if (!content) {
    return content;
  }

  return content.replaceAll(
    /"@codegena\/[^"]+":\s+"([^"]+)"/g,
    (entry: string, oldVersion: string) => entry.replaceAll(oldVersion, actualVersion),
  );
}
