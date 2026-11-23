import { regexToTemplate } from './regex-to-template';
import { printTypeDeclaration } from '../ast-utils';

describe('regexToTemplate', () => {
  it('should convert fixed literal type', async () => {
    const typeNode = regexToTemplate(
      /^fixed-literal-type$/,
    );

    const textDeclaration = printTypeDeclaration('MyLiteralTemplate', typeNode);

    expect(await textDeclaration).toBe(
      'type MyLiteralTemplate = "fixed-literal-type";',
    );
  });

  it('should convert literal type as postfix (without ^-edge)', async () => {
    const typeNode = regexToTemplate(
      /_PROPERTY_POSTFIX$/,
    );

    const textDeclaration = printTypeDeclaration('MyLiteralTemplate', typeNode);

    expect(await textDeclaration).toBe(
      // eslint-disable-next-line no-template-curly-in-string
      'type MyLiteralTemplate = `${string}_PROPERTY_POSTFIX`;',
    );
  });

  it('should convert literal type as prefix (without $-edge)', async () => {
    const typeNode = regexToTemplate(
      /^PROPERTY_PREFIX_/,
    );

    const textDeclaration = printTypeDeclaration('MyLiteralTemplate', typeNode);

    expect(await textDeclaration).toBe(
      // eslint-disable-next-line no-template-curly-in-string
      'type MyLiteralTemplate = `PROPERTY_PREFIX_${string}`;',
    );
  });

  it('should convert literal type (without ^$-edges)', async () => {
    const typeNode = regexToTemplate(
      /TEXT_IN_A_MIDDLE/,
    );

    const textDeclaration = printTypeDeclaration('MyLiteralTemplate', typeNode);

    expect(await textDeclaration).toBe(
      // eslint-disable-next-line no-template-curly-in-string
      'type MyLiteralTemplate = `${string}TEXT_IN_A_MIDDLE${string}`;',
    );
  });

  it('should convert to fixed union type', async () => {
    const typeNode = regexToTemplate(
      /^(first|second|last)$/,
    );

    const textDeclaration = printTypeDeclaration('MyLiteralTemplate', typeNode);

    expect(await textDeclaration).toBe(
      'type MyLiteralTemplate = "first" | "second" | "last";',
    );
  });

  it('should convert to optional union type', async () => {
    const typeNode = regexToTemplate(
      /^(first|second|last)?$/,
    );

    const textDeclaration = printTypeDeclaration('MyLiteralTemplate', typeNode);

    expect(await textDeclaration).toBe(
      'type MyLiteralTemplate = "first" | "second" | "last" | "";',
    );
  });

  it('should convert to fixed union type (without ^$-edges)', async () => {
    const typeNode = regexToTemplate(
      /(first|second|last)/,
    );

    const textDeclaration = printTypeDeclaration('MyLiteralTemplate', typeNode);

    expect(await textDeclaration).toBe(
      // eslint-disable-next-line no-template-curly-in-string
      'type MyLiteralTemplate = `${string}${"first" | "second" | "last"}${string}`;',
    );
  });

  it('should convert to optional union type (without ^$-edges)', async () => {
    const typeNode = regexToTemplate(
      /(first|second|last)?/,
    );

    const textDeclaration = printTypeDeclaration('MyLiteralTemplate', typeNode);

    expect(await textDeclaration).toBe(
      // eslint-disable-next-line no-template-curly-in-string
      'type MyLiteralTemplate = `${string}${"first" | "second" | "last" | ""}${string}`;',
    );
  });

  it('should convert nested disjunctions to template with union types', async () => {
    const typeNode = regexToTemplate(
      /^(abc|def|(ghi|jkl|(mno|pqr)?))(stu|vwx)$/,
    );

    const textDeclaration = printTypeDeclaration('MyLiteralTemplate', typeNode);

    expect(await textDeclaration).toBe(
      // eslint-disable-next-line max-len -- Exact raw TypeScript printer output.
      `type MyLiteralTemplate = \`\${"abc" | "def" | "ghi" | "jkl" | "mno" | "pqr" | ""}\${"stu" | "vwx"}\`;`,
    );
  });

  it('should convert complex regex with non-parseable items', async () => {
    const typeNode = regexToTemplate(
      /[a-z0-9]{1,32}\.(first|second|last).\w+\.[^@#]+#$/,
    );

    const textDeclaration = printTypeDeclaration('MyLiteralTemplate', typeNode);

    expect(await textDeclaration).toBe(
      // eslint-disable-next-line no-template-curly-in-string, max-len
      'type MyLiteralTemplate = `${string}.${"first" | "second" | "last"}.${string}.${string}#`;',
    );
  });

  it('should convert simple email regex', async () => {
    const typeNode = regexToTemplate(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    );

    const textDeclaration = printTypeDeclaration('MyLiteralTemplate', typeNode);

    expect(await textDeclaration).toBe(
      // eslint-disable-next-line no-template-curly-in-string
      'type MyLiteralTemplate = `${string}@${string}.${string}`;',
    );
  });

  it('should convert complex email regex', async () => {
    const typeNode = regexToTemplate(
      // eslint-disable-next-line max-len
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    );

    const textDeclaration = printTypeDeclaration('MyLiteralTemplate', typeNode);

    expect(await textDeclaration).toBe(
      // eslint-disable-next-line no-template-curly-in-string
      'type MyLiteralTemplate = `${string}@${string}`;',
    );
  });

  it('should convert site address regex', async () => {
    const typeNode = regexToTemplate(
      /^https:\/\/(?:www\.)?site\.com(?:[/?#].*)?$/,
    );

    const textDeclaration = printTypeDeclaration('MyLiteralTemplate', typeNode);

    expect(await textDeclaration).toBe(
      // eslint-disable-next-line no-template-curly-in-string
      'type MyLiteralTemplate = `https://${"www." | ""}site.com${string}`;',
    );
  });

  it.each([
    /^PROP_[A-Z][A-Z0-9_]{0,64}$/,
    /^PROP_[A-Z][A-Z0-9_]+$/,
    /^PROP_[A-Z][A-Z0-9_]{32}$/,
  ])('should parse complex quantifier in: %s', async (regex) => {
    const typeNode = regexToTemplate(regex);
    const textDeclaration = printTypeDeclaration('MyLiteralTemplate', typeNode);

    expect(await textDeclaration).toBe(
      // eslint-disable-next-line no-template-curly-in-string
      'type MyLiteralTemplate = `PROP_${string}`;',
    );
  });
});
