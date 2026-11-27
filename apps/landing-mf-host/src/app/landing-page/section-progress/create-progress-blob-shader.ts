import blobDefinition from 'shaders/core/Blob';
import {
  createShader,
  type PresetConfig,
  type ShaderInstance,
  type ShaderOptions,
} from 'shaders/js';

export function createProgressBlobShader(
  canvas: HTMLCanvasElement,
  preset: PresetConfig,
  lifecycle: Pick<ShaderOptions, 'onReady' | 'onError'>,
): Promise<ShaderInstance> {
  return createShader(canvas, preset, {
    ...lifecycle,
    components: [blobDefinition],
    disableTelemetry: true,
    includeBuiltInShaders: false,
  });
}
