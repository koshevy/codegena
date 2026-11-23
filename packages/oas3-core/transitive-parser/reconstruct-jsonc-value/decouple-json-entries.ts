import {
  HasJsonEntriesList,
  ReconstructedJsoncValue,
} from './reconstructed-jsonc-value';
import { isHasJsonEntriesList } from './reconstructed-jsonc-value-typeguards';

export function decoupleJsonEntries(
  reconstructedJsonc: ReconstructedJsoncValue,
): HasJsonEntriesList & {
  reconstructedJsoncWithoutJsonEntries: ReconstructedJsoncValue;
} {
  if (!isHasJsonEntriesList(reconstructedJsonc)) {
    return {
      jsonEntries: [],
      reconstructedJsoncWithoutJsonEntries: reconstructedJsonc,
    };
  }

  const {
    jsonEntries,
    ...reconstructedJsoncWithoutJsonEntries
  } = reconstructedJsonc;

  return {
    jsonEntries,
    reconstructedJsoncWithoutJsonEntries,
  };
}
