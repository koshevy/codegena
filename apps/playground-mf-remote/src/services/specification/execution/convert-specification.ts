import { createSameOriginUrlSchema } from '@codegena/pwa/common';

import { requestHostConversion } from './request-host-conversion';
import type {
  PreparedSpecification,
  SpecificationInput,
} from '../specification-contract';

export async function convertSpecification(
  { id, specUrl }: SpecificationInput,
  signal: AbortSignal,
): Promise<PreparedSpecification> {
  const url = createSameOriginUrlSchema(globalThis.location.origin).parse(specUrl);
  const response = await fetch(url, { redirect: 'error', signal });

  if (!response.ok) {
    throw new Error(`Specification could not be loaded (${response.status}).`);
  }

  const sourceSchemaText = await response.text();

  signal.throwIfAborted();

  const serializedGraph = await requestHostConversion(id, {
    sourceFileId: url.pathname.split('/').at(-1) ?? 'specification.json',
    sourceText: sourceSchemaText,
  }, signal);

  return { serializedGraph, sourceSchemaText };
}
