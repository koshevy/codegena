import { SourceFile } from "typescript";
import { join, parse, relative } from 'path';
import { kebabCase } from 'lodash';
// tslint:disable:no-implicit-dependencies
import {
    FileSavingStrategy,
} from '@codegena/oapi3ts/contract';
// tslint:enable:no-implicit-dependencies

export class DummyFileSavingStrategy implements FileSavingStrategy {
    private _committedFiles: Record<string, SourceFile> = {};

    getDependencyFullPath(modelName: string, operationName: string): string {
        return join(
            '/',
            kebabCase(operationName),
            `${kebabCase(modelName)}.ts`,
        );
    }

    getCommonDependencyFullPath(modelName: string): string {
        return join(
            '/',
            'common',
            `${kebabCase(modelName)}.ts`,
        );
    }

    getRelativePath(from: string, to: string): string {
        const { base, dir } = parse(to);
        const fromDir = parse(from).dir;
        const path = join(relative(fromDir, dir), base);

        return /^\./.test(path) ? path : `./${path}`;
    }

    commit(source: SourceFile): void {
        this._committedFiles[source.fileName] = source;
    }
}
