export interface FileReadingAdapter {
  readFile(srcFilePath: string): string;
}
