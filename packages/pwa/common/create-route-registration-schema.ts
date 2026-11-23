import { z } from 'zod';

import { createSameOriginUrlSchema } from './create-same-origin-url-schema';
import type { ServiceWorkerRouteProps } from './service-worker-route-props';
import {
  serviceWorkerRegistrationPath,
  serviceWorkerRoutePropsSchema,
} from './service-worker-route-props';

function isRegisterableRoutePath(path: string): boolean {
  const hasDotSegments = path.split('/').some((part) => part === '.' || part === '..');
  const isReserved = path.startsWith(serviceWorkerRegistrationPath);

  return !hasDotSegments && !isReserved;
}

export function createRouteRegistrationSchema(
  origin: string,
): z.ZodType<ServiceWorkerRouteProps> {
  const sameOriginUrl = createSameOriginUrlSchema(origin);

  const routeBaseUrl = z.string()
    .regex(/^\/[\w.-]+(?:\/[\w.-]+)*\/?$/)
    .refine(isRegisterableRoutePath,
      'Use a literal, non-root path outside /_register.');

  return serviceWorkerRoutePropsSchema.extend({
    moduleUrl: sameOriginUrl.transform((url) => url.href),
    routeBaseUrl,
  });
}
