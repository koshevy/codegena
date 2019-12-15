"use strict";
exports.__esModule = true;
var oapi3ts_cli_1 = require("@codegena/oapi3ts-cli");
var cliApp = new oapi3ts_cli_1.CliApplication;
cliApp.createTypings();
cliApp.createServices('angular');
