import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import type {
  UltimateParserVisitorResult,
} from '@codegena/oas3-core/ultimate-parser';
import type { ModuleDeclaration, Node as TsNode } from 'typescript';

export type TypescriptParserVisitorResult = UltimateParserVisitorResult<TsNode> & {
  /**
   * Original schema node used when a visitor renders through a derived node.
   */
  annotationsSourceNode?: TransitiveNode;
  importAliases?: Record<string, string>;
  openApiLibrary?: ModuleDeclaration;
};
