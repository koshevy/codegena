import { demoChoices } from './demo-choices';

export function getPlaygroundLabel(specUrl?: string): string {
  const example = demoChoices.find((choice) => choice.specUrl === specUrl);

  return `${example?.label ?? 'Specification'} demo`;
}
