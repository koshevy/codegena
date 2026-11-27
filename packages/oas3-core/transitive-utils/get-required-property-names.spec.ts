import { getRequiredPropertyNames } from './get-required-property-names';
import {
  createStringScalar,
  createStructure,
  createUnion,
} from './testing-utils';

describe('getRequiredPropertyNames', () => {
  it('should collect required properties within the depth limit', () => {
    const structure = createStructure({
      id: {
        ...createStringScalar({ type: 'string' }),
        isRequired: true,
      },
    });

    expect(getRequiredPropertyNames(createUnion([structure]), 2))
      .toEqual(new Set(['id']));
  });

  it('should reject a traversal beyond the depth limit', () => {
    const structure = createStructure({
      id: {
        ...createStringScalar({ type: 'string' }),
        isRequired: true,
      },
    });

    expect(() => getRequiredPropertyNames(createUnion([structure]), 1))
      .toThrow('Required property traversal exceeds maxDepth.');
  });
});
