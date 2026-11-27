import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import type {
  UltimateParserVisitorParsingProps,
} from '@codegena/oas3-core/ultimate-parser';
import type { Node as TsNode } from 'typescript';

import { TypescriptParserVisitorResult } from './typescript-parser-visitor-result';
import { VisitorMicroContext } from './visitor-micro-context';

export interface VisitorFnProps extends UltimateParserVisitorParsingProps<TsNode> {
  microContext?: VisitorMicroContext;
  options?: NonNullable<UltimateParserVisitorParsingProps<TsNode>['options']> & {
    maxLengthTupleThreshold?: number;
    minLengthTupleThreshold?: number;
    useConditionalIfThenElseDeclaration?: boolean;
    transformFilePath?: (
      originalFileName: string,
      transitiveNode: TransitiveNode,
      microContext?: VisitorMicroContext,
    ) => string;
  };
}

export type TypescriptParserVisitorFn = (
  props: VisitorFnProps,
) => TypescriptParserVisitorResult | null;
