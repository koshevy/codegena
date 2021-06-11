import { join } from 'path';
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { experimental } from '@angular-devkit/core';
import { readJson } from 'fs-extra';
import { PreparedSchema, Schema } from '../schema';

type WorkspaceSchema = experimental.workspace.WorkspaceSchema;

export function getPreparedOptions(tree: Tree, rawOptions: Schema): Promise<PreparedSchema> {
    const workspaceFile = tree.read('/angular.json');
    const { createSubdir, domain, hostModule, moduleName } = rawOptions;

    if (!workspaceFile) {
        throw new SchematicsException(`Can't find Angular workspace file!`);
    }

    const workspace: WorkspaceSchema = JSON.parse(
        workspaceFile.toString('utf-8'),
    );
    const project = workspace.projects[rawOptions.project];
    const packageJsonPath = join(project.root, 'package.json');
    console.log('—————', packageJsonPath);
    const packageJson = JSON.parse(tree.read(packageJsonPath)?.toString() ?? '{}');
    const libraryName = packageJson?.['name'] ?? rawOptions.project;

    let rawPath;

    if (project.projectType !== 'library') {
        throw new SchematicsException(
            'Project should be library!',
        );
    }

    if (rawOptions.secondaryEntrypoint) {
        rawPath = join(
            project.root,
            rawOptions.secondaryEntrypoint,
            'src/lib',
        )
    } else {
        rawPath = join(
            project.sourceRoot || join(project.root, 'src'),
            'lib',
        );
    }

    const rootPathLength = tree.getDir('/').path.length;
    const path = (createSubdir ? join(rawPath, domain) : rawPath)
        .substr(rootPathLength ? rootPathLength - 1 : 0);

    return readJson(rawOptions.uri)
        .then(oas3Specification => ({
            domain,
            hostModule,
            libraryName,
            moduleName,
            oas3Specification,
            path,
            projectRoot: project.root,
        }));
}
