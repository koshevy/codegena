import { createGreeting } from '@codegena/oas3-visitor-typescript/greeting';

const ansi = {
  blue: '\u{1B}[34m',
  magenta: '\u{1B}[95m',
  reset: '\u{1B}[0m',
  yellow: '\u{1B}[33m',
} as const;

const sourcePath = '/Users/mira/projects/codegena/specs/oas3-onepassword-connect.json';

interface WarningExample {
  after: string;
  before: string;
  column: number;
  explanation: string;
  line: number;
  message: string;
  target: string;
}

function createWarning({
  after,
  before,
  column,
  explanation,
  line,
  message,
  target,
}: WarningExample): string {
  const lineNumberSpace = ' '.repeat(String(line).length);
  const caretGutter = `  ${lineNumberSpace} ${ansi.yellow}|${ansi.reset} `;
  const caret = `${caretGutter}${' '.repeat(column - 1)}^`;

  return [
    `${ansi.yellow}WARN${ansi.reset}: ${message}`,
    explanation,
    'Encountered at:',
    `${ansi.blue}${sourcePath}:${line}:${column}${ansi.reset}`,
    `  ${ansi.yellow}${line - 1} |${ansi.reset} ${ansi.magenta}${before}${ansi.reset}`,
    `> ${ansi.yellow}${line} |${ansi.reset} ${ansi.magenta}${target}${ansi.reset}`,
    caret,
    `  ${ansi.yellow}${line + 1} |${ansi.reset} ${ansi.magenta}${after}${ansi.reset}`,
  ].join('\n');
}

export const cliTerminalExample = {
  command: [
    'npx oas3ts convert',
    `--schemaFilePath="${sourcePath}"`,
    '-o="./generated"',
    '--mode="separateFiles"',
  ].join(' '),
  greeting: createGreeting(true),
  outputs: [
    createWarning({
      after: '              "type": "object"',
      before: '            },',
      column: 22,
      explanation: 'Used Record<string, unknown> as a fallback.',
      line: 1880,
      message: [
        'Unable to correctly parse object at',
        'components.schemas.Patch.items.properties.value',
      ].join(' '),
      target: '            "value": {',
    }),
    'Generated 69 TypeScript file(s) in 0.24s.',
  ],
  prompt: 'mira@atelier-7 codegena %',
} as const;
