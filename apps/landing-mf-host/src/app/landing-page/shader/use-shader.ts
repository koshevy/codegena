import { DevModeEnvContext } from '@codegena/util-dev-mode';
import { useCallback, useContext, useState } from 'react';

interface ShaderState {
  canRenderShader: boolean;
  handleShaderReady: () => void;
  handleShaderUnavailable: () => void;
  isShaderReady: boolean;
}

/**
 * Keeps decorative shader capability, readiness, and fallback local to each effect.
 */
export function useShader(isEnabled = true): ShaderState {
  const { isTestingMode } = useContext(DevModeEnvContext);

  const [isShaderReady, setIsShaderReady] = useState(false);
  const [isShaderUnavailable, setIsShaderUnavailable] = useState(false);

  const canRenderShader = isEnabled && !isTestingMode && !isShaderUnavailable
    && typeof navigator !== 'undefined' && 'gpu' in navigator;

  const handleShaderUnavailable = useCallback((): void => {
    setIsShaderUnavailable(true);
  }, []);

  const handleShaderReady = useCallback((): void => {
    setIsShaderReady(true);
  }, []);

  return {
    canRenderShader,
    handleShaderReady,
    handleShaderUnavailable,
    isShaderReady,
  };
}
