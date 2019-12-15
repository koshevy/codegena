import { CliApplication } from '@codegena/oapi3ts-cli';

const cliApp = new CliApplication;

cliApp.createTypings();
cliApp.createServices('angular');

