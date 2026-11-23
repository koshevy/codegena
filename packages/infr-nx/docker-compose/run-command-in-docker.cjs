const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execute = promisify(execFile);

/**
 * Run a command in a running Compose service and capture its output.
 */
function runCommandInDocker(service, command, args, { cwd, projectName, workdir }) {
  return execute('docker', [
    'compose', '--project-name', projectName,
    'exec', '--no-tty', '--workdir', workdir, service, command, ...args,
  ], { cwd });
}

module.exports = { runCommandInDocker };
