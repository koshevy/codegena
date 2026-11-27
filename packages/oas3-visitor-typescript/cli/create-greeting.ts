import colors from 'ansi-colors';

const wordmarkRows = [
  ' ██████┐  ██████┐ ██████┐ ███████┐ ██████┐ ███████┐███┐   ██┐ █████┐ ',
  '██┌────┘ ██┌───██┐██┌──██┐██┌────┘██┌────┘ ██┌────┘████┐  ██│██┌──██┐',
  '██│      ██│   ██│██│  ██│█████┐  ██│  ███┐█████┐  ██┌██┐ ██│███████│',
  '██│      ██│   ██│██│  ██│██┌──┘  ██│   ██│██┌──┘  ██│└██┐██│██┌──██│',
  '└██████┐ └██████┌┘██████┌┘███████┐└██████┌┘███████┐██│ └████│██│  ██│',
  ' └─────┘  └─────┘ └─────┘ └──────┘ └─────┘ └──────┘└─┘  └───┘└─┘  └─┘',
];

const intro = 'Welcome to';
const contentWidth = wordmarkRows[0].length;
const subtitle = 'OpenAPI / TypeScript'.padStart(contentWidth);
const innerWidth = contentWidth + 2;
const horizontalBorder = '─'.repeat(innerWidth);
const topBorder = `┌${horizontalBorder}┐`;
const bottomBorder = `└${horizontalBorder}┘`;
const emptyRow = `│${' '.repeat(innerWidth)}│`;

export function createGreeting(
  shouldUseColor = !!process.stdout.isTTY && !process.env['NO_COLOR'],
): string {
  if (!shouldUseColor) {
    const contentRows = [intro, ...wordmarkRows, subtitle]
      .map((row) => `│ ${row.padEnd(contentWidth)} │`);

    return [
      topBorder,
      emptyRow,
      ...contentRows,
      emptyRow,
      bottomBorder,
    ].join('\n');
  }

  const greetingColors = colors.create();

  greetingColors.enabled = true;

  const coloredWordmarkRows = wordmarkRows.map((row) => (
    row.replaceAll(/[┌┐└┘─│]+/g, (borderRun) => greetingColors.gray(borderRun))
      .replaceAll(/█+/g, (blockRun) => greetingColors.bgCyanBright(
        ' '.repeat(blockRun.length),
      ))
  ));

  const coloredVerticalBorder = greetingColors.white('│');

  const coloredEmptyRow = (
    `${coloredVerticalBorder}${' '.repeat(innerWidth)}${coloredVerticalBorder}`
  );

  const coloredContentRows = [
    greetingColors.dim(intro.padEnd(contentWidth)),
    ...coloredWordmarkRows,
    greetingColors.bold.magentaBright(subtitle),
  ].map((row) => `${coloredVerticalBorder} ${row} ${coloredVerticalBorder}`);

  return [
    greetingColors.white(topBorder),
    coloredEmptyRow,
    ...coloredContentRows,
    coloredEmptyRow,
    greetingColors.white(bottomBorder),
  ].join('\n');
}
