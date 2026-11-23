/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';

import { useAppAppearance } from './use-app-appearance';

beforeEach(() => localStorage.clear());

it('keeps the standalone theme across route and application remounts', () => {
  const { result, unmount } = renderHook(() => useAppAppearance());

  expect(result.current.mode).toBe('system');
  act(() => result.current.onModeChange('dark'));
  expect(result.current.mode).toBe('dark');
  unmount();

  const restored = renderHook(() => useAppAppearance());

  expect(restored.result.current.mode).toBe('dark');
});

it('uses the host choice and reports edits to its owner', () => {
  const onModeChange = jest.fn();

  const { result, rerender } = renderHook(({ mode }: { mode: 'dark' | 'light' }) => (
    useAppAppearance({ mode, onModeChange })
  ), { initialProps: { mode: 'dark' } });

  act(() => result.current.onModeChange('light'));
  expect(onModeChange).toHaveBeenCalledTimes(1);
  expect(onModeChange).toHaveBeenCalledWith('light');
  expect(result.current.mode).toBe('dark');
  expect(localStorage.length).toBe(0);
  rerender({ mode: 'light' });
  expect(result.current.mode).toBe('light');
});

it('retains the previous Playground theme when ownership moves to the app', () => {
  localStorage.setItem('codegena.playground.preferences.v1', JSON.stringify({
    themeMode: 'dark',
  }));

  const { result } = renderHook(() => useAppAppearance());

  expect(result.current.mode).toBe('dark');
  act(() => result.current.onModeChange('light'));
  expect(result.current.mode).toBe('light');
});
