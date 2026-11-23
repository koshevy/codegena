import { act, renderHook } from '@testing-library/react';

import { useScrollExpansion } from './use-scroll-expansion';

describe('useScrollExpansion', () => {
  it('retains the controlled expansion value when the tree reports an echo', () => {
    const { result } = renderHook(() => useScrollExpansion());

    act(() => result.current.onExpandedFileIdsChange(['_common']));

    const expanded = result.current.expandedFileIds;

    act(() => result.current.onExpandedFileIdsChange(['_common']));

    expect(result.current.expandedFileIds).toBe(expanded);

    act(() => result.current.onExpandedFileIdsChange(['_common', 'vaults']));

    expect(result.current.expandedFileIds).toEqual(['_common', 'vaults']);

    const expandedTogether = result.current.expandedFileIds;

    act(() => result.current.onExpandedFileIdsChange(['vaults', '_common']));

    expect(result.current.expandedFileIds).toBe(expandedTogether);
  });
});
