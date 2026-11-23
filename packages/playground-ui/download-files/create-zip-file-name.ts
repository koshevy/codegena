export function createZipFileName(sourceFileName: string): string {
  const baseName = sourceFileName.split(/[/\\]/).at(-1) ?? sourceFileName;

  return /\.(json|jsonc)$/i.test(baseName)
    ? baseName.replace(/\.(json|jsonc)$/i, '.zip')
    : `${baseName}.zip`;
}
