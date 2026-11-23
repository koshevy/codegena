import { type Logger, defaultLogger } from '@codegena/oas3-core/logger';
import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import { getNodeErrorText } from '@codegena/oas3-core/transitive-parser';
import colors from 'ansi-colors';
import type { Node } from 'jsonc-parser';

export interface TypescriptParseErrorOptions extends ErrorOptions {
  transitiveNode: TransitiveNode;
  logger?: Logger | false;
}

export class TypescriptParseError extends Error {
  constructor(
    messageHint: string,
    options: TransitiveNode | TypescriptParseErrorOptions,
    logger: Logger | false = defaultLogger,
  ) {
    if (!('transitiveNode' in options)) {
      options = { transitiveNode: options, logger };
    }

    const { transitiveNode, logger: errorLogger = defaultLogger } = options;
    const { node, sourceFileId } = transitiveNode.source;
    const message = TypescriptParseError.getMessage(
      messageHint,
      transitiveNode.source.getOriginalFileContent(),
      transitiveNode.source.node,
      sourceFileId,
    );

    if (errorLogger) {
      errorLogger.error({ node, sourceFileId }, message);
    }

    super(message, options);
    this.name = 'TypescriptParseError';
  }

  private static getMessage(
    messageHint: string,
    originalFileContent: string,
    node?: Node,
    sourceFileId?: string,
  ): string {
    const messageBasePart = [
      colors.bold('Error occurred at converting to TypeScript time with a message:'),
      messageHint,
    ].join('\n');

    if (!node) {
      return colors.red([
        messageBasePart,
        colors.inverse('place is unknown'),
      ].join('\n'));
    }

    return [
      colors.red(messageBasePart),
      getNodeErrorText(originalFileContent, node, sourceFileId),
    ].join('\n');
  }
}
