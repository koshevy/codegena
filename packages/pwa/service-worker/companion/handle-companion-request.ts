import { createCompanionExecutionRequestSchema } from '@codegena/pwa/common';

import { loadModuleImplementation } from './load-module-implementation';

export async function handleCompanionRequest(
  data: unknown,
  origin: string,
): Promise<unknown> {
  const request = createCompanionExecutionRequestSchema(origin).parse(data);
  const implementation = await loadModuleImplementation(request.moduleUrl);

  return implementation(...request.params);
}
