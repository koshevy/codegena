import { type Logger, defaultLogger } from '@codegena/oas3-core/logger';
import colors from 'ansi-colors';
import type {
  ParseError as JsoncParseError,
  Node,
} from 'jsonc-parser';

import { getNodeErrorText } from './utils';

export interface JsonParseErrorOptions extends ErrorOptions {
  originalFileContent: string;
  node?: Node | null;
  jsoncParseErrors?: JsoncParseError[];
  logger?: Logger | false;
  sourceFileId?: string;
}

export class JsonParseError extends Error {
  constructor(
    messageHint: string,
    options: string | JsonParseErrorOptions,
    node: Node | null = null,
    jsoncParseErrorsOrOptions: (
      JsoncParseError[] | Omit<JsonParseErrorOptions, 'originalFileContent'>
    ) = [],
    legacyLogger: Logger | false = defaultLogger,
  ) {
    if (typeof options === 'string') {
      const diagnostics = Array.isArray(jsoncParseErrorsOrOptions)
        ? { jsoncParseErrors: jsoncParseErrorsOrOptions, logger: legacyLogger }
        : jsoncParseErrorsOrOptions;

      options = { ...diagnostics, originalFileContent: options, node };
    }

    const {
      originalFileContent,
      node: sourceNode,
      jsoncParseErrors = [],
      logger = defaultLogger,
      sourceFileId,
    } = options;

    const message = JsonParseError.getMessage(
      messageHint,
      originalFileContent,
      sourceNode ?? jsoncParseErrors[0],
      sourceFileId,
    );

    if (logger) {
      logger.error(
        { node: sourceNode, jsoncParseErrors, sourceFileId },
        message,
      );
    }

    super(message, options);
    this.name = 'JsonParseError';
  }

  private static getMessage(
    messageHint: string,
    originalFileContent: string,
    node?: Pick<Node, 'offset'>,
    sourceFileId?: string,
  ): string {
    const messageBasePart = [
      colors.bold('Error occurred at JSON parsing time with a message:'),
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
