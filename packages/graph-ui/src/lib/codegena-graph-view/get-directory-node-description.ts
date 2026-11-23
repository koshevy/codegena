/** Describes only the files and directories directly inside one directory. */
export function getDirectoryNodeDescription(
  directoryCount: number,
  fileCount: number,
): string {
  const directories = directoryCount === 1 ? 'directory' : 'directories';
  const files = fileCount === 1 ? 'file' : 'files';

  return `${directoryCount} ${directories} · ${fileCount} ${files}`;
}
