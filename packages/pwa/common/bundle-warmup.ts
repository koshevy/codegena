import { z } from 'zod';

import { bundleWarmupGroupLimit } from './bundle-warmup-group-limit';

const groupName = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);
const groupFiles = z.array(z.string()).max(256);

export const clientShellBuildHeader = 'X-Codegena-Client-Build';
export const clientShellFilesSchema = groupFiles.min(1);

export const bundleWarmupManifestPathSchema = z.string()
  .max(2048)
  .regex(/^(?:[\w-][\w.-]*\/)*[\w-][\w.-]*\.json$/);

export const bundleWarmupRequestSchema = z.strictObject({
  buildId: z.string().min(1),
  groups: z.array(groupName).min(1).max(bundleWarmupGroupLimit),
  manifestPath: bundleWarmupManifestPathSchema.optional(),
  type: z.literal('warm-bundles'),
});

export const bundleWarmupManifestSchema = z.strictObject({
  buildId: z.string().min(1),
  clientShellGroup: groupName.optional(),
  groups: z.record(groupName, groupFiles),
});

export type BundleWarmupRequest = z.infer<typeof bundleWarmupRequestSchema>;
export type BundleWarmupManifest = z.infer<typeof bundleWarmupManifestSchema>;
