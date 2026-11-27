import {
  extractTransitiveNodesFromSchema,
  type ExtractTransitiveNodesFromSchemaProps,
} from '@codegena/oas3-core/transitive-parser';
import {
  UltimateParser,
  type UltimateParserVisitor,
  type UltimateParserVisitorResultGroup,
} from '@codegena/oas3-core/ultimate-parser';
import type { Node as TsNode, SourceFile } from 'typescript';

import { TypescriptParserVisitor } from './typescript-parser-visitor';
import type { VisitorFnProps } from './typescript-parser-visitor-fn';

export type JsonSchemaToTypescriptProps = ExtractTransitiveNodesFromSchemaProps & {
  mode: 'singleFile' | 'separateFiles';
  rootSchemaTypeName?: string;
  typescriptVisitorOptions?: VisitorFnProps['options'];
};

export async function jsonSchemaToTypescript({
  mode,
  rootSchemaTypeName,
  typescriptVisitorOptions,
  ...otherProps
}: JsonSchemaToTypescriptProps): Promise<
  UltimateParserVisitorResultGroup<SourceFile, TsNode>[]
> {
  const transitiveNodes = extractTransitiveNodesFromSchema(otherProps).map((node) => (
    rootSchemaTypeName && !node.name
      ? { ...node, suggestedName: rootSchemaTypeName }
      : node
  ));

  const typescriptVisitor: UltimateParserVisitor<
    TsNode,
    SourceFile
  > = new TypescriptParserVisitor(
    undefined,
    typescriptVisitorOptions,
  );

  const parser = new UltimateParser([typescriptVisitor], otherProps.logger);

  if (mode === 'singleFile') {
    return [parser.renderAllTransitiveNodesInSingleFile(
      typescriptVisitor,
      transitiveNodes,
    )];
  }

  return parser.renderAllTransitiveNodesGrouped(typescriptVisitor, transitiveNodes);
}
