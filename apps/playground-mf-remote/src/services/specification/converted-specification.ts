import { graphSearchPayloadSchema } from '@codegena/graph-search-core';
import { z } from 'zod';

export const convertedSpecificationSchema = z.object({
  graph: graphSearchPayloadSchema,
  sourceSchemaText: z.string(),
});

export type ConvertedSpecification = z.infer<typeof convertedSpecificationSchema>;
