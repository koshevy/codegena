import { Oas3Specification } from '@codegena/definitions/oas3';

export interface Schema {
    domain: string;
    hostModule?: string;
    project: string;
    secondaryEntrypoint?: string;
    uri: string;
    moduleName: string;
    createSubdir: boolean;
}

export interface PreparedSchema {
    domain: string;
    hostModule?: string;
    libraryName: string;
    moduleName: string;
    oas3Specification: Oas3Specification;
    path: string;
    projectRoot: string;
}
