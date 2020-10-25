import { SourceFile } from "typescript";

export interface FileSavingStrategy {
    getDependencyFullPath(modelName: string, operationName: string): string;
    getCommonDependencyFullPath(modelName: string): string;
    getRelativePath(from: string, to: string): string;
    commit(source: SourceFile): void;
}
