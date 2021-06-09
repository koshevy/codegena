import { SourceFile } from "typescript";
import { Schema as JsonSchema, Generic } from '@codegena/definitions/json-schema';

export interface Dependency {
    source: SourceFile;
    dependencies?: Dependency [];
    schema: JsonSchema | Generic;
}

export interface DependencyCollection {
    allDependencies: Dependency[];
    commonDependencies: Dependency[];
}
