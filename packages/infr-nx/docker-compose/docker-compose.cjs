const { spawn } = require('node:child_process');
const { resolve } = require('node:path');

function runDockerCompose({
  composeFile,
  dryRun,
  services = [],
}, { projectName, projectsConfigurations, root }, command) {
  const projects = projectsConfigurations?.projects ?? {};

  if (!projectName || !Object.hasOwn(projects, projectName)) {
    throw new Error('Docker Compose requires an Nx project.');
  }

  const project = projects[projectName];
  const args = [
    'compose',
    '--file',
    composeFile,
    ...(dryRun ? ['--dry-run'] : []),
    ...command,
    ...services,
  ];

  return new Promise((resolveResult, reject) => {
    const docker = spawn('docker', args, {
      cwd: resolve(root, project.root),
      stdio: 'inherit',
    });

    docker.once('error', reject);
    docker.once('close', (code) => resolveResult({ success: code === 0 }));
  });
}

function build(options, context) {
  return runDockerCompose(options, context, ['build']);
}

function up({
  abortOnContainerExit,
  build: buildImages,
  detached,
  exitCodeFrom,
  ...options
}, context) {
  const args = [
    'up',
    ...(buildImages ? ['--build'] : []),
    ...(detached ? ['--detach'] : []),
    ...(abortOnContainerExit ? ['--abort-on-container-exit'] : []),
    ...(exitCodeFrom ? ['--exit-code-from', exitCodeFrom] : []),
  ];

  return runDockerCompose(options, context, args);
}

module.exports = { build, up };
