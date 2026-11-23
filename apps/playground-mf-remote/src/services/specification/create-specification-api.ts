import {
  createSameOriginUrlSchema,
  type ServiceWorkerHttpHandler,
} from '@codegena/pwa/common';

import { readSpecificationInput } from './read-specification-input';
import {
  type ConvertSpecification,
  specificationJobSchema,
} from './specification-contract';
import { SpecificationJobs } from './specification-jobs';

export function createSpecificationApi(
  origin: string,
  convert: ConvertSpecification,
): ServiceWorkerHttpHandler {
  const jobs = new SpecificationJobs(convert);
  const urlSchema = createSameOriginUrlSchema(origin);

  return async (request) => {
    if (request.method === 'POST') {
      const parsed = await readSpecificationInput(request);

      if (!parsed.success) {
        return Response.json({ error: 'A specification URL is required.' },
          { status: 400 });
      }

      const url = urlSchema.safeParse(parsed.data.specUrl);

      if (!url.success) {
        return Response.json({ error: 'A same-origin URL is required.' },
          { status: 403 });
      }

      jobs.start({ id: parsed.data.id, specUrl: url.data.href });

      return new Response(null, { status: 201 });
    }

    const requestUrl = new URL(request.url);
    const jobId = specificationJobSchema.safeParse({
      id: requestUrl.searchParams.get('id'),
    });

    if (!jobId.success) {
      return Response.json({ error: 'A conversion ID is required.' }, { status: 400 });
    }

    if (request.method === 'DELETE') {
      jobs.cancel(jobId.data.id);

      return new Response(null, { status: 204 });
    }

    const result = jobs.get(jobId.data.id);

    if (!result) {
      return Response.json({ error: 'Conversion not found.' }, { status: 404 });
    }

    if (result.status === 'pending') {
      return new Response(null, { status: 202 });
    }

    if (result.status === 'failed') {
      return Response.json({ error: result.message }, { status: 422 });
    }

    const { serializedGraph, sourceSchemaText } = result.value;
    const sourceJson = JSON.stringify(sourceSchemaText);
    const body = `{"graph":${serializedGraph},"sourceSchemaText":${sourceJson}}`;

    return new Response(body, { headers: { 'Content-Type': 'application/json' } });
  };
}
