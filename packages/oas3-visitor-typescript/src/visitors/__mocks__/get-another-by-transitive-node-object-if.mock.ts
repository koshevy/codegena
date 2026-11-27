import type { Logger } from '@codegena/oas3-core/logger';
import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import { UltimateParser } from '@codegena/oas3-core/ultimate-parser';

import { TypescriptParserVisitor } from '../../typescript-parser-visitor';
import type {
  TypescriptParserVisitorResult,
} from '../../typescript-parser-visitor-result';
import { visitorIf } from '../if';
import { visitorRangeOfValues } from '../range-of-values';
import { visitorRef } from '../ref';
import { visitorSomeOf } from '../some-of';
import { visitorStructure } from '../structure';

const typescriptParserVisitor = new TypescriptParserVisitor([
  visitorRangeOfValues,
  visitorIf,
  visitorSomeOf,
  visitorRef,
  visitorStructure,
]);

const ultimateParser = new UltimateParser([typescriptParserVisitor]);

export function setUltimateParserLogger(logger: Logger): void {
  ultimateParser.setLogger(logger);
}

export function resetUltimateParser(): void {
  ultimateParser.resetCaches();
}

export function getAnotherByTransitiveNodeObjectIfMock(
  transitiveNode: TransitiveNode,
): TypescriptParserVisitorResult {
  return ultimateParser.renderTransitiveNodeWithoutImports(
    typescriptParserVisitor,
    transitiveNode,
  ) as TypescriptParserVisitorResult;
}
