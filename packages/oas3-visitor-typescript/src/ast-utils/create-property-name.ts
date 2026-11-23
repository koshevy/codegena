import {
  factory,
  isIdentifierPart,
  isIdentifierStart,
  ScriptTarget,
} from 'typescript';

export function createPropertyName(propertyName: string): string | ReturnType<
  typeof factory.createStringLiteral
> {
  let index = 0;
  let codePoint = propertyName.codePointAt(index);

  if (codePoint === undefined
    || !isIdentifierStart(codePoint, ScriptTarget.Latest)
  ) {
    return factory.createStringLiteral(propertyName);
  }

  index += codePoint > 0xFFFF ? 2 : 1;

  while (index < propertyName.length) {
    codePoint = propertyName.codePointAt(index);

    if (codePoint === undefined
      || !isIdentifierPart(codePoint, ScriptTarget.Latest)
    ) {
      return factory.createStringLiteral(propertyName);
    }

    index += codePoint > 0xFFFF ? 2 : 1;
  }

  return propertyName;
}
