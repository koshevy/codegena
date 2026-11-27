export interface BuildExecutorSchema {
  composeFile: string;
  dryRun?: boolean;
  environment?: string;
  outputPath: string;
  projects?: string[];
  rootEnvFilePath?: string;
  services?: string[];
}
