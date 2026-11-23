import { defaultLogger, type Logger } from '@codegena/oas3-core/logger';
import { pascalCaseTypeName } from '@codegena/oas3-core/transitive-utils';

const alreadyUsedNames = new Map<string, true>();
const maxNonUniqueNames = 1000;

export function resetIdentifiers(): void {
  alreadyUsedNames.clear();
}

export interface CreateTypeIdentifierNameProps {
  fallbackNameAspect: string;
  logger?: Logger;
  name?: string;
  /** Inline type expressions do not reserve declaration names. */
  reserveName?: boolean;
  suggestedName?: string;
}

function getAndRegisterUniqueName(
  name: string,
  logger = defaultLogger,
  shouldSkipWarning = false,
): string {
  if (!alreadyUsedNames.has(name)) {
    alreadyUsedNames.set(name, true);

    return name;
  }

  for (let inc = 1; inc < maxNonUniqueNames; inc++) {
    const anotherName = `${name}${inc}`;

    if (!shouldSkipWarning) {
      logger.warn(
        `Identifier name "${name}" is already in use. Changed to ${anotherName}.`,
      );
    }

    if (!alreadyUsedNames.has(anotherName)) {
      alreadyUsedNames.set(anotherName, true);

      return anotherName;
    }
  }

  throw new Error(
    `Max non unique names count reached: ${maxNonUniqueNames}!`,
  );
}

export function createTypeIdentifierName({
  fallbackNameAspect,
  logger,
  name,
  reserveName = true,
  suggestedName,
}: CreateTypeIdentifierNameProps): string {
  const nonUniqueName = pascalCaseTypeName(
    name ?? suggestedName ?? fallbackNameAspect,
  );

  if (!reserveName) {
    return nonUniqueName;
  }

  return getAndRegisterUniqueName(
    nonUniqueName,
    logger,
    nonUniqueName === fallbackNameAspect,
  );
}
