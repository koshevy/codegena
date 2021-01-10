import { HasContentType, HasResponses } from '@codegena/definitions/aspects';
import {
    Oas3Operation,
    Oas3Server,
} from '@codegena/definitions/oas3';
import { Schema as JsonSchema } from '@codegena/definitions/json-schema';
import {
    Dependency,
    DependencyCollection,
} from './source';

export interface Response extends Dependency {
    schema: HasResponses<HasContentType<JsonSchema>>;
}

export interface Request extends Dependency {
    schema: HasContentType<JsonSchema>;
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
    servers: Oas3Server[];
    queryParameters: string[] | null;
}
