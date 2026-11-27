import { renderHook } from '@testing-library/react';
import { createElement, useContext } from 'react';
import type { PropsWithChildren } from 'react';

import type { DevModeEnv } from './dev-mode-env';
import { DevModeEnvContext } from './dev-mode-env-context';

describe('DevModeEnvContext', () => {
  it('defaults to development without testing behavior', () => {
    const { result } = renderHook(() => useContext(DevModeEnvContext));

    expect(result.current).toEqual({ isDevMode: true, isTestingMode: false });
  });

  it.each<DevModeEnv>([
    { isDevMode: false, isTestingMode: false },
    { isDevMode: false, isTestingMode: true },
    { isDevMode: true, isTestingMode: true },
  ])('uses the supplied execution flags: %j', (value) => {
    const { result } = renderHook(() => useContext(DevModeEnvContext), {
      wrapper: ({ children }: PropsWithChildren) => createElement(
        DevModeEnvContext.Provider, { value }, children,
      ),
    });

    expect(result.current).toEqual(value);
  });
});
