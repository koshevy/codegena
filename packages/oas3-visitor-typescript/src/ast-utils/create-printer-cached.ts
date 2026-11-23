import {
  createPrinter,
  NewLineKind,
  type Printer,
} from 'typescript';

const printerCache: { current?: Printer } = {};

export function createPrinterCached(): Printer {
  printerCache.current ??= createPrinter({
    newLine: NewLineKind.LineFeed,
  });

  return printerCache.current;
}
