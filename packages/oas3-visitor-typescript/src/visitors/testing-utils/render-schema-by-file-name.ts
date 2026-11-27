import { type Logger } from '@codegena/oas3-core/logger';
import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import { extractTransitiveNodesFromSchema } from '@codegena/oas3-core/transitive-parser';
import { join } from 'node:path';

import type {
  TypescriptParserVisitorFn,
  VisitorFnProps,
} from '../../typescript-parser-visitor-fn';
import type {
  TypescriptParserVisitorResult,
} from '../../typescript-parser-visitor-result';
import type { VisitorMicroContext } from '../../visitor-micro-context';
import { getAnotherByTransitiveNodeObjectIfMock } from '../__mocks__';

function getFixturePath(fileName: string): string {
  return join(__dirname, '../__fixtures__', fileName);
}

export interface RenderSchemaByFileNameProps {
  fixtureFilePath: string;
  getAnotherByTransitiveNode?: (
    transitiveNode: TransitiveNode,
  ) => TypescriptParserVisitorResult;
  isInline: boolean;
  logger?: Logger;
  mainVisitor: TypescriptParserVisitorFn;
  microContext?: VisitorMicroContext;
  options?: VisitorFnProps['options'];
  suggestedName?: string;
  renderAllTypes?: boolean;
}

export async function renderSchemaByFileName({
  fixtureFilePath,
  getAnotherByTransitiveNode = getAnotherByTransitiveNodeObjectIfMock,
  isInline = false,
  logger,
  mainVisitor,
  microContext,
  options,
  suggestedName,
  renderAllTypes = false,
}: RenderSchemaByFileNameProps): Promise<string | undefined> {
  const transitiveNodes = extractTransitiveNodesFromSchema({
    logger,
    srcFilePath: getFixturePath(fixtureFilePath),
  });

  if (renderAllTypes) {
    const renderedTypes = await Promise.all(transitiveNodes.map(async (
      transitiveNode,
      index,
    ) => {
      const subResult = getAnotherByTransitiveNode({
        ...transitiveNode,
        isInline,
        suggestedName: index
          ? transitiveNode.suggestedName
          : (suggestedName ?? transitiveNode.suggestedName),
      });

      return subResult?.toString();
    }));

    return renderedTypes.join('\n\n');
  }

  const [mainNode] = transitiveNodes;
  const result = mainVisitor({
    getAnotherByTransitiveNode,
    logger,
    microContext,
    options,
    suggestedName,
    transitiveNode: {
      ...mainNode,
      isInline,
    },
  });

  return result?.toString();
}
