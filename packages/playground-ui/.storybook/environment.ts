declare const CODEGENA_BUILD_ID: string;

export const appBuildId = import.meta.env.DEV
  ? `dev-${crypto.randomUUID()}`
  : CODEGENA_BUILD_ID;
