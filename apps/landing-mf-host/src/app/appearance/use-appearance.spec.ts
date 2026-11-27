/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';

import { AppearanceProvider } from './appearance-provider';
import { themePreferenceStorageKey } from './theme-preference-storage';
import { useAppearance } from './use-appearance';

describe('useAppearance', () => {
  beforeEach(() => localStorage.clear());

  it('starts dark and restores a saved choice after remounting', () => {
    const { result, unmount } = renderHook(useAppearance, {
      wrapper: AppearanceProvider,
    });

    expect(result.current.mode).toBe('dark');

    act(() => result.current.setMode('light'));
    expect(localStorage.getItem(themePreferenceStorageKey)).toBe('light');
    unmount();

    const restored = renderHook(useAppearance, { wrapper: AppearanceProvider });

    expect(restored.result.current.mode).toBe('light');
  });

  it('keeps System as the preference rather than storing a resolved color', () => {
    localStorage.setItem(themePreferenceStorageKey, 'system');

    const { result } = renderHook(useAppearance, { wrapper: AppearanceProvider });

    expect(result.current.mode).toBe('system');
    act(() => result.current.setMode('dark'));
    expect(localStorage.getItem(themePreferenceStorageKey)).toBe('dark');
  });

  it('ignores an unrecognised saved preference', () => {
    localStorage.setItem(themePreferenceStorageKey, 'sepia');

    const { result } = renderHook(useAppearance, { wrapper: AppearanceProvider });

    expect(result.current.mode).toBe('dark');
  });

  it('keeps the shared appearance stable when the selected mode has not changed', () => {
    const { result } = renderHook(useAppearance, { wrapper: AppearanceProvider });
    const appearance = result.current;

    act(() => appearance.setMode('dark'));

    expect(result.current).toBe(appearance);
  });
});

it('shares appearance between consumers and persists their changes', () => {
  localStorage.clear();

  const { result } = renderHook(() => ({
    first: useAppearance(),
    second: useAppearance(),
  }), { wrapper: AppearanceProvider });

  expect(result.current.first).toBe(result.current.second);

  act(() => result.current.first.setMode('light'));

  expect(result.current.second.mode).toBe('light');
  expect(result.current.first).toBe(result.current.second);
  expect(localStorage.getItem(themePreferenceStorageKey)).toBe('light');
});
