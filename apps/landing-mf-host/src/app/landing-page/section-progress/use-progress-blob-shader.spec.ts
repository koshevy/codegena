/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { useInView } from 'motion/react';
import { createShader, type ShaderInstance } from 'shaders/js';

import { useProgressBlobShader } from './use-progress-blob-shader';

jest.mock('shaders/js', () => ({ createShader: jest.fn() }));
jest.mock('shaders/core/Blob', () => ({ default: { name: 'Blob' } }));
jest.mock('motion/react', () => ({ useInView: jest.fn(() => true) }));

function createShaderMock(): jest.Mocked<ShaderInstance> {
  return {
    destroy: jest.fn(),
    getFailureReason: jest.fn(() => null),
    pause: jest.fn(),
    resize: jest.fn(),
    resume: jest.fn(),
    update: jest.fn(),
  };
}

describe('useProgressBlobShader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useInView).mockReturnValue(true);
  });

  it('reuses one renderer across full-screen and offscreen pauses', async () => {
    const shader = createShaderMock();
    const canvasRef = { current: document.createElement('canvas') };
    const onReady = jest.fn();
    const onUnavailable = jest.fn();

    jest.mocked(createShader).mockImplementation((...args) => {
      args[2]?.onReady?.();

      return Promise.resolve(shader);
    });

    const { rerender, unmount } = renderHook((isPaused) => useProgressBlobShader({
      canvasRef,
      isEnabled: true,
      isPaused,
      onReady,
      onUnavailable,
      shouldReduceMotion: false,
    }), { initialProps: false });

    await waitFor(() => expect(onReady).toHaveBeenCalledTimes(1));

    rerender(true);
    expect(shader.pause).toHaveBeenCalledTimes(1);

    rerender(false);
    expect(shader.resume).toHaveBeenCalledTimes(1);

    jest.mocked(useInView).mockReturnValue(false);
    rerender(false);
    expect(shader.pause).toHaveBeenCalledTimes(2);

    jest.mocked(useInView).mockReturnValue(true);
    rerender(false);
    expect(shader.resume).toHaveBeenCalledTimes(2);
    expect(createShader).toHaveBeenCalledTimes(1);
    expect(onUnavailable).not.toHaveBeenCalled();

    unmount();
    expect(shader.destroy).toHaveBeenCalledTimes(1);
  });

  it('renders the first frame before pausing a late initialization', async () => {
    const pending = Promise.withResolvers<ShaderInstance>();
    const shader = createShaderMock();
    const canvasRef = { current: document.createElement('canvas') };
    const onReady = jest.fn();
    const onUnavailable = jest.fn();

    jest.mocked(createShader).mockReturnValue(pending.promise);

    const { rerender } = renderHook((isPaused) => useProgressBlobShader({
      canvasRef,
      isEnabled: true,
      isPaused,
      onReady,
      onUnavailable,
      shouldReduceMotion: false,
    }), { initialProps: false });

    rerender(true);

    await act(async () => {
      pending.resolve(shader);
      await pending.promise;
    });
    expect(shader.pause).not.toHaveBeenCalled();

    act(() => jest.mocked(createShader).mock.calls[0]?.[2]?.onReady?.());
    expect(shader.pause).toHaveBeenCalledTimes(1);
  });

  it('releases a renderer that finishes initializing after unmount', async () => {
    const pending = Promise.withResolvers<ShaderInstance>();
    const shader = createShaderMock();
    const canvasRef = { current: document.createElement('canvas') };

    jest.mocked(createShader).mockReturnValue(pending.promise);

    const { unmount } = renderHook(() => useProgressBlobShader({
      canvasRef,
      isEnabled: true,
      isPaused: false,
      onReady: jest.fn(),
      onUnavailable: jest.fn(),
      shouldReduceMotion: false,
    }));

    await waitFor(() => expect(createShader).toHaveBeenCalledTimes(1));
    unmount();

    await act(async () => {
      pending.resolve(shader);
      await pending.promise;
    });
    expect(shader.destroy).toHaveBeenCalledTimes(1);
    expect(shader.resume).not.toHaveBeenCalled();
  });

  it('keeps the static fallback when the GPU cannot render', async () => {
    const shader = createShaderMock();
    const canvasRef = { current: document.createElement('canvas') };
    const onReady = jest.fn();
    const onUnavailable = jest.fn();

    shader.getFailureReason.mockReturnValue('unsupported');
    jest.mocked(createShader).mockResolvedValue(shader);

    renderHook(() => useProgressBlobShader({
      canvasRef,
      isEnabled: true,
      isPaused: true,
      onReady,
      onUnavailable,
      shouldReduceMotion: false,
    }));

    await waitFor(() => expect(onUnavailable).toHaveBeenCalledTimes(1));
    expect(onReady).not.toHaveBeenCalled();
    expect(shader.pause).not.toHaveBeenCalled();
  });
});
