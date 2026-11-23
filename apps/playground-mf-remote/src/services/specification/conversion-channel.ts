import { z } from 'zod';

export const conversionWorkerReadySchema = z.strictObject({ ready: z.literal(true) });
export const conversionWorkerStartSchema = z.strictObject({ id: z.uuid() });
export const conversionWorkerInputSchema = z.strictObject({
  sourceFileId: z.string(),
  sourceText: z.string(),
});
export const conversionWorkerResultSchema = z.union([
  z.strictObject({ serializedGraph: z.string() }),
  z.strictObject({ error: z.string() }),
]);

export type ConversionWorkerResult = z.infer<typeof conversionWorkerResultSchema>;

export function getConversionChannelName(id: string): string {
  return `codegena-conversion:${id}`;
}
