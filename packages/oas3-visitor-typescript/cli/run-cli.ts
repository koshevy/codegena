import { convertCommand } from './commands';
import { createGreeting } from './create-greeting';

const programDescription = [
  'Generate TypeScript from JSON Schema and OpenAPI 3 with an AST-powered engine.',
  'Dependency graphs and source metadata support IDEs, AI agents, and other tools.',
].join(' ');

export async function runCli(args = process.argv.slice(2)): Promise<void> {
  const { default: yargs } = await import('yargs');
  const y = yargs(args);

  process.stdout.write(`${createGreeting()}\n`);

  await y
    .scriptName('oas3-visitor-typescript')
    .wrap(Math.max(90, y.terminalWidth()))
    .usage('$0 <command> [options]')
    .epilogue(programDescription)
    .option('schemaFilePath', {
      demandOption: true,
      describe: 'Path to the JSON Schema file',
      type: 'string',
    })
    .option('outputDir', {
      alias: 'o',
      demandOption: true,
      describe: 'Directory for generated files',
      type: 'string',
    })
    .command(convertCommand)
    .command('analyze', 'Analyze a schema (coming soon)')
    .demandCommand(1)
    .strict()
    .help()
    .parseAsync();
}
