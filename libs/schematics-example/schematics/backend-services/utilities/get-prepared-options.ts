import { join } from 'path';
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { experimental } from '@angular-devkit/core';
import { readJson } from "fs-extra";
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
    let rawPath;

    if (rawOptions.secondaryEntrypoint) {
        rawPath = join(
            project.root,
            rawOptions.secondaryEntrypoint,
            'src/lib',
        )
    } else {
        rawPath = join(
            project.sourceRoot || join(project.root, 'src'),
            project.projectType === 'application' ? 'app' : 'lib',
        );
    }

    const rootPatLength = tree.getDir('/').path.length;
    const path = (createSubdir ? join(rawPath, domain) : rawPath)
        .substr(rootPatLength ? rootPatLength - 1 : 0);

    return readJson(rawOptions.uri)
        .then(oas3Specification => ({
            domain,
            hostModule,
            oas3Specification,
            path,
            moduleName,
        }));
}
