import { z } from 'zod';

import {
  graphSearchDeclarationTypeSchema,
  graphSearchLocationSchema,
  graphSearchPayloadSchema,
} from './graph-search-payload-schema';
import type { GraphSearchSuggestionsResult } from '../graph-search-suggestions-result';

export const graphSearchApiPath = '/api/graph-search';

const sourceSpecificationSchema = z.object({ fileName: z.string(), text: z.string() });

const optionsSchema = z.strictObject({
  declarationSuggestionCount: z.number().optional(),
  defaultSuggestionCount: z.number().optional(),
  directorySuggestionCount: z.number().optional(),
  fileSuggestionCount: z.number().optional(),
  minimumQueryLength: z.number().optional(),
  recentSuggestionCount: z.number().optional(),
  searchSuggestionCount: z.number().optional(),
  sourceSpecification: sourceSpecificationSchema.optional(),
  warningSuggestionCount: z.number().optional(),
});

export const graphSearchInitializeRequestSchema = z.strictObject({
  action: z.literal('initialize'),
  graphPayload: graphSearchPayloadSchema,
  options: optionsSchema.optional(),
  ownerSpecId: z.string().min(1),
  sessionId: z.string().min(1),
});

export const graphSearchQueryRequestSchema = z.strictObject({
  action: z.enum(['search', 'autoSuggest']),
  query: z.string(),
  sessionId: z.string().min(1),
});

export const graphSearchDisposeRequestSchema = z.strictObject({
  action: z.literal('dispose'),
  sessionId: z.string().min(1),
});

export const graphSearchRequestSchema = z.union([
  graphSearchInitializeRequestSchema,
  graphSearchQueryRequestSchema,
  graphSearchDisposeRequestSchema,
]);

export type GraphSearchRequest = z.infer<typeof graphSearchRequestSchema>;
export type GraphSearchInitializeRequest = z.infer<
  typeof graphSearchInitializeRequestSchema
>;

const snippetLineSchema = z.object({
  content: z.string(),
  lineNumber: z.number(),
});

const snippetSchema = z.object({
  activeColumnNumber: z.number(),
  activeLineNumber: z.number(),
  lines: z.array(snippetLineSchema),
});

const suggestionSchema = z.object({
  id: z.string(),
  nodeId: z.string().optional(),
  sourceLocation: graphSearchLocationSchema.optional(),
  title: z.string(),
});

const graphSuggestionSchema = z.union([
  suggestionSchema.extend({
    directoryCount: z.number(), fileCount: z.number(), kind: z.literal('directory'),
  }),
  suggestionSchema.extend({
    declarationType: graphSearchDeclarationTypeSchema, fileName: z.string(),
    kind: z.literal('declaration'), snippet: snippetSchema.optional(),
  }),
  suggestionSchema.extend({ kind: z.literal('file'), snippet: snippetSchema.optional() }),
  suggestionSchema.extend({ kind: z.literal('warning') }),
  suggestionSchema.extend({
    kind: z.literal('spec-snippet'), snippet: snippetSchema.optional(),
  }),
]);

export const graphSearchResultSchema: z.ZodType<GraphSearchSuggestionsResult> = z.object({
  isTruncated: z.boolean(),
  suggestions: z.array(graphSuggestionSchema),
});
