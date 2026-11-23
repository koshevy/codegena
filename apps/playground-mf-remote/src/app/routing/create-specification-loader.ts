import type { LoaderFunctionArgs } from 'react-router-dom';

import { initializeBrowserServices } from '../../services';
import {
  convertedSpecificationSchema,
  type ConvertedSpecification,
  loadSpecification,
} from '../../services/specification';

/**
 * Own service initialization and abortable conversion for one router session.
 */
export function createSpecificationLoader(
  appBuildId: string,
): (args: LoaderFunctionArgs) => Promise<ConvertedSpecification> {
  let servicesReady: Promise<void> | undefined;

  return async ({ params, request }) => {
    const pendingServices = servicesReady ??= initializeBrowserServices(appBuildId);

    try {
      await pendingServices;
    }
    catch (error) {
      if (servicesReady === pendingServices) {
        servicesReady = undefined;
      }

      throw error;
    }

    request.signal.throwIfAborted();

    const specUrl = params['specUrl'];

    if (!specUrl) {
      throw new Error('A specification URL is required.');
    }

    const value = await loadSpecification(specUrl, request.signal, appBuildId);

    return convertedSpecificationSchema.parse(value);
  };
}
