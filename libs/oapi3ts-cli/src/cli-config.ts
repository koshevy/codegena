import { ConvertorConfig, defaultConfig } from '@codegena/oapi3ts';

/**
 * Extended config used in {@link CliApplication}
 */
export interface CliConfig extends ConvertorConfig {

    /**
     * Base directory where code should be saved
     */
    destPath: string;

    /**
     * Should typing be in different files, or not
     */
    separatedFiles: boolean;

    /**
     * Name of directory with dist API-services
     * for Angular.
     */
    servicesDirectory: string;

    /**
     * Path of source OAS-file (should be json)
     */
    srcPath: string;

    typingsFromServices: string;
}

export const defaultCliConfig: CliConfig = {
    ...defaultConfig,
    destPath: './dist',
    separatedFiles: true,
    servicesDirectory: './services',
    srcPath: null,
    typingsFromServices: '../typings'
};
