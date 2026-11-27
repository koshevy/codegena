import { join } from 'node:path';

export interface GetDockerComposeFilenameProps {
  environment: string;
  outputPath: string;
  projects: string[];
  workspaceRoot: string;
}

export function getMergedDockerComposeFilePath({
  environment,
  outputPath,
  projects,
  workspaceRoot,
}: GetDockerComposeFilenameProps): string {
  return join(
    workspaceRoot,
    outputPath,
    `${environment}-docker-compose.${environment}.${projects.join('-')}.yml`,
  );
}

export interface GetMergedEnvFilePathProps {
  environment: string;
  outputPath: string;
  projects: string[];
}

export function getMergedEnvFilePath({
  environment,
  outputPath,
  projects,
}: GetMergedEnvFilePathProps): string {
  return join(
    outputPath,
    `${environment}.${projects.join('-')}.env`,
  );
}
