import type { GraphPayload } from '@codegena/graph-core';
import { z } from 'zod';

export const graphSearchLocationSchema = z.object({
  col: z.number(),
  fileName: z.string(),
  line: z.number(),
});

const logSchema = z.object({
  error: z.object({
    message: z.string(),
    name: z.string(),
    stack: z.string().optional(),
  }).optional(),
  jsoncNode: graphSearchLocationSchema.optional(),
  level: z.string(),
  message: z.string(),
});

export const graphSearchDeclarationTypeSchema = z.enum([
  'Interface', 'Namespace', 'Union', 'Intersection', 'Array',
  'Record', 'Literal', 'Scalar', 'Alias',
]);

const directoryNodeSchema = z.object({
  data: z.looseObject({
    kind: z.literal('directory'), label: z.string(), relativeDirectoryPath: z.string(),
  }),
  id: z.string(),
  parentId: z.string().optional(),
  type: z.literal('directory'),
});

const fileNodeSchema = z.object({
  data: z.looseObject({
    fileName: z.string(), kind: z.literal('group'), label: z.string(),
    programmingLanguage: z.string(), text: z.string(),
  }),
  id: z.string(),
  parentId: z.string().optional(),
  type: z.literal('default'),
});

const declarationNodeSchema = z.object({
  data: z.looseObject({
    ast: z.looseObject({}),
    col: z.number().optional(),
    declarationType: graphSearchDeclarationTypeSchema,
    identifierName: z.string().optional(),
    kind: z.literal('item'),
    label: z.string(),
    line: z.number().optional(),
    logs: z.array(logSchema),
    programmingLanguage: z.string(),
    programmingLanguageVersion: z.string(),
    relativeFilePath: z.string(),
    sourceLocation: graphSearchLocationSchema,
    text: z.string(),
  }),
  extent: z.literal('parent'),
  id: z.string(),
  parentId: z.string(),
});

const relationSchema = z.enum(['import', 'placement', 'reference']);

const edgeSchema = z.object({
  data: z.object({ relation: relationSchema }),
  id: z.string(),
  label: relationSchema,
  source: z.string(),
  target: z.string(),
});

const nodeSchema = z.union([
  directoryNodeSchema, fileNodeSchema, declarationNodeSchema,
]);

/**
 * Graph data accepted by the search API after visitor ASTs have been removed.
 */
export const graphSearchPayloadSchema: z.ZodType<GraphPayload> = z.object({
  edges: z.array(edgeSchema),
  logs: z.array(logSchema),
  nodes: z.array(nodeSchema),
});
