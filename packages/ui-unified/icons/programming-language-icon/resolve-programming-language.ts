import { ProgrammingLanguage } from './programming-language';

export function resolveProgrammingLanguage(value: string): ProgrammingLanguage {
  const matchingLanguage = Object.values(ProgrammingLanguage).find((candidate) => (
    candidate === value
  ));

  return matchingLanguage ?? ProgrammingLanguage.Unknown;
}
