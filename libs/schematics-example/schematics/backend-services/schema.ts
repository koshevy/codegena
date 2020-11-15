import { Oas3Specification } from "@codegena/definitions/oas3";

export interface Schema {
    domain: string;
    hostModule?: string;
    project: string;
    secondaryEntrypoint?: string;
    uri: string;
    moduleName: string;
}

export interface PreparedSchema {
    domain: string;
    hostModule?: string;
    oas3Specification: Oas3Specification;
    path: string;
    moduleName: string;
}
