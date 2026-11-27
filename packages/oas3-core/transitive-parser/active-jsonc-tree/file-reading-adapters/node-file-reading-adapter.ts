import { FileReadingAdapter } from '../file-reading-adapter';

export const nodeFileReadingAdapter: FileReadingAdapter = {
  readFile: (srcFilePath) => {
    if (typeof process === 'undefined'
      || typeof process.getBuiltinModule !== 'function'
    ) {
      throw new Error(
        'Reading srcFilePath requires Node.js 22+ or a file reading adapter.',
      );
    }

    const fileSystem = process.getBuiltinModule('node:fs');

    if (!fileSystem) {
      throw new Error('Node.js file system module is unavailable.');
    }

    return fileSystem.readFileSync(srcFilePath, 'utf8');
  },
};
