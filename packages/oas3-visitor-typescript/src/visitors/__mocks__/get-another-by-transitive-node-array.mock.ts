import type { Logger } from '@codegena/oas3-core/logger';
import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import { UltimateParser } from '@codegena/oas3-core/ultimate-parser';

import { TypescriptParserVisitor } from '../../typescript-parser-visitor';
import type {
  TypescriptParserVisitorResult,
} from '../../typescript-parser-visitor-result';

const typescriptParserVisitor = new TypescriptParserVisitor();
const ultimateParser = new UltimateParser([typescriptParserVisitor]);

export function setArrayUltimateParserLogger(logger: Logger): void {
  ultimateParser.setLogger(logger);
}

export function resetArrayUltimateParser(): void {
  ultimateParser.resetCaches();
}

export function getAnotherByTransitiveNodeArrayMock(
  transitiveNode: TransitiveNode,
): TypescriptParserVisitorResult {
  return ultimateParser.renderTransitiveNodeWithoutImports(
    typescriptParserVisitor,
    transitiveNode,
  ) as TypescriptParserVisitorResult;
}
