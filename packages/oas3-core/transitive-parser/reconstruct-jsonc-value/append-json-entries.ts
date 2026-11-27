export function appendJsonEntries(
  entries: string[] | undefined,
  path: string,
  nestedEntries: string[],
): void {
  if (!entries) {
    return;
  }

  entries.push(path);

  nestedEntries.forEach((entry) => {
    entries.push(entry);
  });
}
