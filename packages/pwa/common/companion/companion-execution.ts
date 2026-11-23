import { z } from 'zod';

import { createSameOriginUrlSchema } from '../create-same-origin-url-schema';

/**
 * Arguments for a feature module's default function. The companion passes them
 * through without interpreting their contents or requiring an HTTP context.
 */
export const companionExecutionRequestSchema = z.strictObject({
  moduleUrl: z.string().min(1).max(2048),
  params: z.array(z.unknown()),
});

export type CompanionExecutionRequest = z.infer<
  typeof companionExecutionRequestSchema
>;

export function createCompanionExecutionRequestSchema(
  origin: string,
): z.ZodType<CompanionExecutionRequest> {
  const moduleUrl = createSameOriginUrlSchema(origin).transform((url) => url.href);

  return companionExecutionRequestSchema.extend({ moduleUrl });
}

export const companionExecutionSuccessSchema = z.strictObject({
  result: z.unknown(),
});

export const companionExecutionFailureSchema = z.strictObject({
  error: z.string(),
});

/**
 * Returned by the companion's message listener. A route adapter validates a
 * successful result against its HTTP response contract separately.
 */
export const companionExecutionResponseSchema = z.union([
  companionExecutionSuccessSchema,
  companionExecutionFailureSchema,
]);

export type CompanionExecutionResponse = z.infer<
  typeof companionExecutionResponseSchema
>;

export type CompanionImplementation = (...params: unknown[]) => unknown;

export interface CompanionImplementationModule {
  default: CompanionImplementation;
}
