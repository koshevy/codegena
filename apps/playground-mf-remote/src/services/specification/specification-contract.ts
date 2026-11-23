import { z } from 'zod';

export const specificationApiPath = '/api/specification';
export const specificationJobSchema = z.strictObject({ id: z.uuid() });
export const specificationInputSchema = z.strictObject({
  id: z.uuid(),
  specUrl: z.string().min(1),
});
export interface PreparedSpecification {
  serializedGraph: string;
  sourceSchemaText: string;
}

export type SpecificationInput = z.infer<typeof specificationInputSchema>;

export type SpecificationJobResult = (
  | { status: 'pending' }
  | { status: 'ready'; value: PreparedSpecification }
  | { status: 'failed'; message: string }
);

export type ConvertSpecification = (
  input: SpecificationInput,
  signal: AbortSignal,
) => Promise<PreparedSpecification>;
