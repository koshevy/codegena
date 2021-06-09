import { flatten, intersectionBy } from 'lodash';
// tslint:disable:no-implicit-dependencies
import { Dependency, DependencyCollection } from '@codegena/oapi3ts/contract';
// tslint:enable:no-implicit-dependencies
import { uniqDependencies } from './uniq-dependencies';

/**
 * Mutates arrays!
 */
export function extractCommonDependencies(
    ...dependencySets: Dependency[][]
): DependencyCollection {
    const allIntersections = [];
    let allDependencies;

    if (dependencySets.length === 1) {
        [allDependencies] = dependencySets;

        return {
            allDependencies,
            commonDependencies: allDependencies,
        };
    }

    for (let i = 0; i < dependencySets.length - 1; i++) {
        for (let ii = i + 1; ii < dependencySets.length; ii++) {
            const firstSet = dependencySets[i];
            const secondSet = dependencySets[ii];

            const intersections = intersectionBy(
                firstSet,
                secondSet,
                dependency => dependency.source.fileName,
            );

            if (intersections.length) {
                allIntersections.push(...intersections);
                intersections.forEach(intersection => {
                    replaceDependencyBy(firstSet, intersection);
                    replaceDependencyBy(secondSet, intersection);
                });
            }
        }
    }

    const commonDependencies = uniqDependencies(allIntersections);
    allDependencies = uniqDependencies(flatten(dependencySets));

    return {
        allDependencies,
        commonDependencies,
    };
}

/**
 * mutates array
 */
function replaceDependencyBy(collection: Dependency[], claimToBeSame: Dependency): void {
    const foundIndex = collection.findIndex(
        item => item.source.text === claimToBeSame.source.text,
    );

    if (foundIndex !== -1) {
        collection[foundIndex] = claimToBeSame;
    }
}
