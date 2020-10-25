import { Oas3Specification } from '@codegena/definitions/oas3';
import { Operation } from './operation';
import { DependencyCollection } from './source';

export interface Facade extends DependencyCollection {
    operations: Operation[];
    specification: Oas3Specification

    commit(): void;
}
