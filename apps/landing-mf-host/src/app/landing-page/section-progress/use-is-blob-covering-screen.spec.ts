/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { motionValue } from 'motion/react';

import { useIsBlobCoveringScreen } from './use-is-blob-covering-screen';

describe('useIsBlobCoveringScreen', () => {
  it('reports coverage at full scale and clears it when the blob shrinks', () => {
    const scale = motionValue(2);

    const { result } = renderHook(() => useIsBlobCoveringScreen(true, scale));

    expect(result.current).toBe(false);

    act(() => scale.set(32));
    expect(result.current).toBe(true);

    act(() => scale.set(31.9));
    expect(result.current).toBe(false);
  });

  it('reads the scale at mount and excludes sections before the closing sequence', () => {
    const scale = motionValue(32);

    const { result, rerender } = renderHook((isClosingSequence) => (
      useIsBlobCoveringScreen(isClosingSequence, scale)
    ), { initialProps: true });

    expect(result.current).toBe(true);

    rerender(false);
    expect(result.current).toBe(false);
  });
});
