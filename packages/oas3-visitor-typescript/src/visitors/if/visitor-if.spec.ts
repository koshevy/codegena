/* eslint-disable max-len -- Exact generated TypeScript output is compared verbatim. */
import { createTestingLogger, type Logger } from '@codegena/oas3-core/logger';

import { visitorIf } from './visitor-if';
import { resetIdentifiers } from '../../misc-utils';
import type { VisitorFnProps } from '../../typescript-parser-visitor-fn';
import type { VisitorMicroContext } from '../../visitor-micro-context';
import {
  resetUltimateParser,
  setUltimateParserLogger,
} from '../__mocks__';
import { renderSchemaByFileName } from '../testing-utils';

function createMicroContext(): VisitorMicroContext {
  return { shouldBeGroupedWith: [] };
}

describe('visitor-if', () => {
  let logger: Logger;

  async function renderIfSchemaByFileName(
    fixtureFilePath: string,
    microContext?: VisitorMicroContext,
    options?: VisitorFnProps['options'],
  ): Promise<string | undefined> {
    return renderSchemaByFileName({
      fixtureFilePath,
      isInline: false,
      logger,
      mainVisitor: visitorIf,
      microContext,
      options,
    });
  }

  beforeEach(() => {
    logger = createTestingLogger([]);
    resetIdentifiers();
    resetUltimateParser();
    setUltimateParserLogger(logger);
  });

  it('should enable selectable declarations for all parts', async () => {
    const microContext = createMicroContext();

    const renderedResult = await renderIfSchemaByFileName(
      'if-object-then.json',
      microContext,
      { useConditionalIfThenElseDeclaration: true },
    );

    expect(renderedResult).toBe(`type IfObjectThen<TPart extends "base" | "if" | "then" | "result", TRealPart extends IfObjectThen<"base", TRealPart> = {
    loginBy: "phone" | "email";
}> = TPart extends "base" ? {
    loginBy: "phone" | "email";
} : TPart extends "if" ? {
    loginBy: "phone";
} : TPart extends "then" ? {
    country: unknown;
    phoneNumber: unknown;
} : TPart extends "result" ? ConditionalResultType<IfObjectThen<"base", TRealPart>, TRealPart, IfObjectThen<"if", TRealPart>, IfObjectThen<"then", TRealPart>, IfObjectThen<"base", TRealPart>> : never;`);
  });

  it('should enable selectable declarations for if, then, and else', async () => {
    const microContext = createMicroContext();

    const renderedResult = await renderIfSchemaByFileName(
      'if-object-then-else.json',
      microContext,
      { useConditionalIfThenElseDeclaration: true },
    );

    expect(renderedResult).toBe(`type IfObjectThenElse<TPart extends "base" | "if" | "then" | "else" | "result", TRealPart extends IfObjectThenElse<"base", TRealPart> = {
    deliveryMethod: "courier" | "pickup";
}> = TPart extends "base" ? {
    deliveryMethod: "courier" | "pickup";
} : TPart extends "if" ? {
    deliveryMethod: "courier";
} : TPart extends "then" ? {
    shippingAddress: unknown;
    recipientPhone: unknown;
} : TPart extends "else" ? {
    pickupStore: unknown;
} : TPart extends "result" ? ConditionalResultType<IfObjectThenElse<"base", TRealPart>, TRealPart, IfObjectThenElse<"if", TRealPart>, IfObjectThenElse<"then", TRealPart>, IfObjectThenElse<"else", TRealPart>> : never;`);
  });

  it('should create selectable declarations for if and else schemas when enabled', async () => {
    const microContext = createMicroContext();

    const renderedResult = await renderIfSchemaByFileName(
      'if-object-else.json',
      microContext,
      { useConditionalIfThenElseDeclaration: true },
    );

    expect(renderedResult).toBe(`type IfObjectElse<TPart extends "base" | "if" | "else" | "result", TRealPart extends IfObjectElse<"base", TRealPart> = {
    accountType: "personal" | "business";
}> = TPart extends "base" ? {
    accountType: "personal" | "business";
} : TPart extends "if" ? {
    accountType: "business";
} : TPart extends "else" ? {
    personalEmail: unknown;
} : TPart extends "result" ? ConditionalResultType<IfObjectElse<"base", TRealPart>, TRealPart, IfObjectElse<"if", TRealPart>, IfObjectElse<"base", TRealPart>, IfObjectElse<"else", TRealPart>> : never;`);
  });

  it('should create the default union for if and then', async () => {
    const renderedResult = await renderIfSchemaByFileName('if-object-then.json');

    expect(renderedResult).toBe(`type IfObjectThen = {
    loginBy: "phone";
    country: unknown;
    phoneNumber: unknown;
} | {
    loginBy: "email";
};`);
  });

  it('should create a union with narrowed then and else variants by default', async () => {
    const renderedResult = await renderIfSchemaByFileName(
      'if-object-then-else.json',
    );

    expect(renderedResult).toBe(`type IfObjectThenElse = {
    deliveryMethod: "courier";
    shippingAddress: unknown;
    recipientPhone: unknown;
} | {
    deliveryMethod: "pickup";
    pickupStore: unknown;
};`);
  });

  it('should create a union with an else-only negative variant by default', async () => {
    const renderedResult = await renderIfSchemaByFileName('if-object-else.json');

    expect(renderedResult).toBe(`type IfObjectElse = {
    accountType: "business";
} | {
    accountType: "personal";
    personalEmail: unknown;
};`);
  });

  it('should not group the conditional result helper for default declarations', async () => {
    const microContext = createMicroContext();

    await renderIfSchemaByFileName('if-object-then.json', microContext);

    expect(microContext.shouldBeGroupedWith).toEqual([]);
  });

  it('should group the conditional result helper once per generation context', async () => {
    const microContext = createMicroContext();

    await renderIfSchemaByFileName(
      'if-object-then.json',
      microContext,
      { useConditionalIfThenElseDeclaration: true },
    );
    await renderIfSchemaByFileName(
      'if-object-then.json',
      microContext,
      { useConditionalIfThenElseDeclaration: true },
    );

    expect(microContext.shouldBeGroupedWith).toHaveLength(1);

    const [conditionalResult] = microContext.shouldBeGroupedWith;

    if (typeof conditionalResult === 'function') {
      throw new TypeError('Expected a resolved conditional result helper.');
    }

    expect(await conditionalResult.toString()).toBe(`type ConditionalResultType<TBasePart, TRealPart extends TBasePart, TConditionPart, TPositiveCase, TNegativeCase> = TRealPart & (TRealPart extends TConditionPart ? TPositiveCase : TNegativeCase);`);
  });

  it('should ignore schemas without a conditional node', async () => {
    const renderedResult = await renderIfSchemaByFileName(
      'object-properties-empty.jsonc',
    );

    expect(renderedResult).toBeUndefined();
  });
});
