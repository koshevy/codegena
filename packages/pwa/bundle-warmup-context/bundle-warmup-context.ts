import { createContext } from 'react';

import type { BundleWarmupRuntime } from './bundle-warmup-runtime';

/**
 * Supplies the build and manifest prepared at app startup.
 */
export const BundleWarmupContext = createContext<BundleWarmupRuntime | null>(null);
