export function downloadFromUrl(fileName: string, url: string): void {
  const link = document.createElement('a');

  link.download = fileName;
  link.href = url;
  link.click();
}
