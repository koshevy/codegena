import {
    Oas3Operation,
    Oas3ResponseMap,
    SupportedContentTypeMap,
} from '@codegena/definitions/oas3';
import { Schema as JsonSchema } from '@codegena/definitions/json-schema';
import {
    Dependency,
    DependencyCollection,
} from './source';

export interface Response extends Dependency {
    schema: {
        [code in keyof Oas3ResponseMap]: SupportedContentTypeMap<JsonSchema>;
    }
}

export interface Request extends Dependency {
    schema: SupportedContentTypeMap<JsonSchema>;
}

export interface Parameters extends Dependency {
    schema: JsonSchema;
}

export interface Operation extends DependencyCollection {
    dependencies: Dependency[];
    method: string;
    oas3Operation: Oas3Operation;
    oas3OperationJsonPath: string[];
    path: string;
    parameters: Parameters,
    request: Request;
    response: Response;
    servers: string[];
}
