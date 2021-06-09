import { SourceFile } from 'typescript';
import { join, parse, relative } from 'path';
import { kebabCase, trim } from 'lodash';
import { DirEntry, SchematicsException, Tree } from '@angular-devkit/schematics';
import { FileSavingStrategy } from '@codegena/oapi3ts/contract';

export class SchematicHostSavingStrategy implements FileSavingStrategy {
    private targetDirectory: DirEntry;

    constructor(private tree: Tree, targetDirectoryPath: string) {
        this.targetDirectory = tree.getDir(targetDirectoryPath);

        if (!this.targetDirectory) {
            tree.create(join(targetDirectoryPath, '.gitkeep'), '');
            this.targetDirectory = tree.getDir(targetDirectoryPath);

            if (!this.targetDirectory) {
                throw new SchematicsException(
                    `Can't resolve working directory: ${targetDirectoryPath}!`,
                );
            }
        }
    }

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
        const pathInTree = join(
            this.targetDirectory.path,
            trim(source.fileName, '/'),
        );
        this.tree.create(pathInTree, source.text);
    }
}
