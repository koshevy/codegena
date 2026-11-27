import { createGreeting } from './create-greeting';

const expectedWordmarkRows = [
  ' ██████┐  ██████┐ ██████┐ ███████┐ ██████┐ ███████┐███┐   ██┐ █████┐ ',
  '██┌────┘ ██┌───██┐██┌──██┐██┌────┘██┌────┘ ██┌────┘████┐  ██│██┌──██┐',
  '██│      ██│   ██│██│  ██│█████┐  ██│  ███┐█████┐  ██┌██┐ ██│███████│',
  '██│      ██│   ██│██│  ██│██┌──┘  ██│   ██│██┌──┘  ██│└██┐██│██┌──██│',
  '└██████┐ └██████┌┘██████┌┘███████┐└██████┌┘███████┐██│ └████│██│  ██│',
  ' └─────┘  └─────┘ └─────┘ └──────┘ └─────┘ └──────┘└─┘  └───┘└─┘  └─┘',
];

const expectedIntro = 'Welcome to';
const expectedSubtitle = 'OpenAPI / TypeScript'.padStart(69);
const expectedTopBorder = `┌${'─'.repeat(71)}┐`;
const expectedBottomBorder = `└${'─'.repeat(71)}┘`;
const expectedEmptyRow = `│${' '.repeat(71)}│`;

const expectedContentRows = [
  expectedIntro,
  ...expectedWordmarkRows,
  expectedSubtitle,
].map((row) => `│ ${row.padEnd(69)} │`);

describe('createGreeting', () => {
  it('should render a single-line box with one character of padding', () => {
    expect(createGreeting(false)).toBe([
      expectedTopBorder,
      expectedEmptyRow,
      ...expectedContentRows,
      expectedEmptyRow,
      expectedBottomBorder,
    ].join('\n'));
  });

  it('should color the outer border white and preserve the wordmark colors', () => {
    const coloredWordmarkRows = expectedWordmarkRows.map((row) => (
      row.replaceAll(/[┌┐└┘─│]+/g, (borderRun) => `\u{1B}[90m${borderRun}\u{1B}[39m`)
        .replaceAll(/█+/g, (blockRun) => (
          `\u{1B}[106m${' '.repeat(blockRun.length)}\u{1B}[49m`
        ))
    ));

    const coloredBorder = '\u{1B}[37m│\u{1B}[39m';

    const coloredEmptyRow = (
      `${coloredBorder}${' '.repeat(71)}${coloredBorder}`
    );

    const coloredContentRows = [
      `\u{1B}[2m${expectedIntro.padEnd(69)}\u{1B}[22m`,
      ...coloredWordmarkRows,
      `\u{1B}[1m\u{1B}[95m${expectedSubtitle}\u{1B}[39m\u{1B}[22m`,
    ].map((row) => `${coloredBorder} ${row} ${coloredBorder}`);

    expect(createGreeting(true)).toBe([
      `\u{1B}[37m${expectedTopBorder}\u{1B}[39m`,
      coloredEmptyRow,
      ...coloredContentRows,
      coloredEmptyRow,
      `\u{1B}[37m${expectedBottomBorder}\u{1B}[39m`,
    ].join('\n'));
  });
});
