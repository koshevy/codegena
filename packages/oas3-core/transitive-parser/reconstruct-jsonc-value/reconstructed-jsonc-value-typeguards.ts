import { scalarTypes } from './reconstruct-jsonc-unknown';
import type {
  HasJsonEntriesList,
  ReconstructedArrayJsoncValue,
  ReconstructedJsoncValue,
  ReconstructedObjectJsoncValue,
  ReconstructedScalarJsoncValue,
} from './reconstructed-jsonc-value';

export function isHasJsonEntriesList<
  TAdditionalType = unknown,
>(value: TAdditionalType): value is HasJsonEntriesList & TAdditionalType {
  return typeof value === 'object'
    && value !== null
    && 'jsonEntries' in value
    && Array.isArray(value.jsonEntries);
}

export function isReconstructedJsoncValue(
  value: unknown,
): value is ReconstructedJsoncValue {
  return typeof value === 'object'
    && value !== null
    && 'jsonPath' in value
    && Array.isArray(value.jsonPath)
    && 'node' in value
    && typeof value.node === 'object'
    && value.node !== null
    && 'getOriginalFileContent' in value
    && typeof value.getOriginalFileContent === 'function'
    && 'value' in value
    && value.value !== undefined;
}

export function isReconstructedArrayJsoncValue(
  value: unknown,
): value is ReconstructedArrayJsoncValue {
  return isReconstructedJsoncValue(value)
    && value.node.type === 'array'
    && Array.isArray(value.value)
    && 'items' in value
    && Array.isArray(value.items);
}

export function isReconstructedObjectJsoncValue(
  value: unknown,
): value is ReconstructedObjectJsoncValue {
  return isReconstructedJsoncValue(value)
    && value.node.type === 'object'
    && typeof value.value === 'object'
    && value.value !== null
    && 'properties' in value
    && typeof value.properties === 'object'
    && value.properties !== null;
}

export function isReconstructedScalarJsoncValue<
  T extends boolean | null | number | string = boolean | null | number | string,
>(
  value: unknown,
): value is ReconstructedScalarJsoncValue<T> {
  return isReconstructedJsoncValue(value)
    && scalarTypes.includes(value.node.type);
}
