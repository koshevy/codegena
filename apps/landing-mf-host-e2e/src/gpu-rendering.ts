import type { Locator, Page } from '@playwright/test';

/**
 * Counts native canvas draws without replacing the GPU texture or renderer.
 * CSS animation alone cannot prove that a WebGPU renderer stops submitting frames.
 */
export async function observeGpuFrames(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const getCurrentTexture = GPUCanvasContext.prototype.getCurrentTexture;

    GPUCanvasContext.prototype.getCurrentTexture = function getTrackedTexture(
      this: GPUCanvasContext,
    ): GPUTexture {
      const texture = getCurrentTexture.call(this);
      const canvas = this.canvas;

      if (canvas instanceof HTMLCanvasElement) {
        const frameCount = Number(canvas.dataset['gpuFrameCount'] ?? 0);

        canvas.dataset['gpuFrameCount'] = String(frameCount + 1);
      }

      return texture;
    };
  });
}

export async function getGpuFrameCount(blob: Locator): Promise<number> {
  const frameCount = await blob.locator('canvas').getAttribute('data-gpu-frame-count');

  return Number(frameCount ?? 0);
}
