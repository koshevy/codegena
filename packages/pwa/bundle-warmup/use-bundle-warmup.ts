import type { BundleWarmupExtrasGroups } from '@codegena/pwa/bundle-warmup-config';
import { BundleWarmupContext } from '@codegena/pwa/bundle-warmup-context';
import { useContext, useEffect, useMemo } from 'react';

import { createBundleWarmupSession } from './create-bundle-warmup-session';
import { useHasPainted } from './use-has-painted';

interface UseBundleWarmupProps {
  readonly warmAfterPaintedGroups: readonly string[];
  readonly extrasGroups: BundleWarmupExtrasGroups;
  readonly currentExtrasTurn?: string;
}

/**
 * Warm the first groups after paint and each named extras turn once per owner.
 * The result indicates when the current first-paint groups have had a frame.
 */
export function useBundleWarmup({
  warmAfterPaintedGroups,
  extrasGroups,
  currentExtrasTurn,
}: UseBundleWarmupProps): { hasPainted: boolean } {
  const runtime = useContext(BundleWarmupContext);
  const buildId = runtime?.buildId;
  const canWarmBundles = runtime?.canWarmBundles ?? false;
  const manifestPath = runtime?.manifestPath;

  // Manifest group names exclude commas. Equal ordered groups share a paint gate.
  const paintKey = warmAfterPaintedGroups.join(',');
  const hasPainted = useHasPainted(paintKey);

  const session = useMemo(() => {
    if (!buildId) {
      return null;
    }

    return createBundleWarmupSession({
      buildId,
      canWarmBundles,
      manifestPath,
    });
  }, [
    buildId,
    canWarmBundles,
    manifestPath,
  ]);

  const hasSelectedTurn = currentExtrasTurn !== undefined
    && Object.hasOwn(extrasGroups, currentExtrasTurn);
  const selectedGroups = hasSelectedTurn
    ? extrasGroups[currentExtrasTurn]
    : undefined;

  useEffect(() => session?.attach(), [session]);

  useEffect(() => {
    if (currentExtrasTurn !== undefined && selectedGroups) {
      session?.queueExtras(currentExtrasTurn, selectedGroups);
    }

    if (hasPainted) {
      void session?.warmAfterPaint(paintKey, warmAfterPaintedGroups);
    }
  }, [
    currentExtrasTurn,
    hasPainted,
    paintKey,
    selectedGroups,
    session,
    warmAfterPaintedGroups,
  ]);

  return { hasPainted };
}
