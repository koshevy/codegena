/**
 * Shared settings for end-to-end tests.
 */
export const e2eCommonOptions = {
  screenshots: {
    maxDiffPixels: 20,
    threshold: 0.2,
  },
} as const;
