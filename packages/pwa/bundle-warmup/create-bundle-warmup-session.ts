import type { BundleWarmupRuntime } from '@codegena/pwa/bundle-warmup-context';

import type { BundleWarmupSender } from './connect-bundle-warmup';

interface BundleWarmupSession {
  attach: () => () => void;
  queueExtras: (turn: string, groups: readonly string[]) => void;
  warmAfterPaint: (paintKey: string, groups: readonly string[]) => Promise<void>;
}

async function loadBundleWarmupSender(
  runtime: BundleWarmupRuntime,
  signal: AbortSignal,
): Promise<BundleWarmupSender> {
  const { connectBundleWarmup } = await import('./connect-bundle-warmup');

  signal.throwIfAborted();

  return connectBundleWarmup(runtime);
}

async function sendWarmupBatches(
  sender: Promise<BundleWarmupSender>,
  batches: readonly (readonly string[])[],
  signal: AbortSignal,
): Promise<void> {
  const send = await sender;

  if (!signal.aborted) {
    batches.forEach((groups) => send(groups));
  }
}

export function createBundleWarmupSession(
  runtime: BundleWarmupRuntime,
): BundleWarmupSession {
  const queuedTurns = new Set<string>();
  let pendingExtras: (readonly string[])[] = [];
  let lastPaintKey: string | undefined;
  let ownerController: AbortController | undefined;
  let sender: Promise<BundleWarmupSender> | undefined;

  function attach(): () => void {
    const controller = new AbortController();

    ownerController = controller;

    return () => controller.abort();
  }

  function queueExtras(turn: string, groups: readonly string[]): void {
    if (!runtime.canWarmBundles || groups.length === 0 || queuedTurns.has(turn)) {
      return;
    }

    queuedTurns.add(turn);
    pendingExtras.push(groups);
  }

  async function warmAfterPaint(
    paintKey: string,
    groups: readonly string[],
  ): Promise<void> {
    const signal = ownerController?.signal;

    if (!signal || signal.aborted) {
      return;
    }

    const canWarmInitial = runtime.canWarmBundles
      && groups.length > 0
      && paintKey !== lastPaintKey;

    const batches = pendingExtras;

    pendingExtras = [];
    lastPaintKey = paintKey;

    if (canWarmInitial) {
      batches.unshift(groups);
    }

    if (sender && batches.length === 0) {
      return;
    }

    sender ??= loadBundleWarmupSender(runtime, signal);

    try {
      await sendWarmupBatches(sender, batches, signal);
    }
    catch {
      // Features can load on demand if the browser cannot warm their files.
    }
  }

  return { attach, queueExtras, warmAfterPaint };
}
