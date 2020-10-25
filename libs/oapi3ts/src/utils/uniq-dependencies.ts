import { uniqBy } from 'lodash';
// tslint:disable:no-implicit-dependencies
import { Dependency } from '@codegena/oapi3ts/contract';
// tslint:enable:no-implicit-dependencies

export function uniqDependencies(dependencies: Dependency[]): Dependency[] {
    return uniqBy(dependencies, dependency => dependency.source.text);
}
