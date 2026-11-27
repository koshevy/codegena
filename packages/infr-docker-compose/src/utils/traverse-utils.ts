import type { ExecutorContext } from '@nx/devkit';
import { resolve } from 'node:path';

import type { BuildExecutorSchema } from '../executors/build/schema';

export interface DockerComposeConfigs {
  dockerComposeFiles: string[];
  envFiles: string[];
  projects: string[];
  workspaceRoot: string;
}

export function findDockerComposeConfigs({
  composeFile,
  environment,
  projects,
  rootEnvFilePath,
}: BuildExecutorSchema, context: ExecutorContext): DockerComposeConfigs {
  const { projectName, projectsConfigurations, root } = context;
  const selectedProjects = projects ?? (projectName ? [projectName] : []);

  if (!selectedProjects.length) {
    throw new Error('Docker Compose requires an Nx project.');
  }

  const projectRoots = selectedProjects.map((name) => {
    const project = projectsConfigurations?.projects[name];

    if (!project) {
      throw new Error(`Unknown Docker Compose project: ${name}`);
    }

    return resolve(root, project.root);
  });
  const workspaceRoot = projectRoots[1] ? root : projectRoots[0];
  const dockerComposeFiles = projectRoots.map(
    (projectRoot) => resolve(projectRoot, composeFile),
  );
  const envFiles = environment
    ? projectRoots.map((projectRoot) => resolve(projectRoot, `.env.${environment}`))
    : [];

  if (rootEnvFilePath) {
    const sharedEnvFile = environment
      ? rootEnvFilePath.replace('{environment}', environment)
      : rootEnvFilePath;

    envFiles.unshift(resolve(root, sharedEnvFile));
  }

  return { dockerComposeFiles, envFiles, projects: selectedProjects, workspaceRoot };
}
