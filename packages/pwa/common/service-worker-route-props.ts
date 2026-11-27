import { z } from 'zod';

export const serviceWorkerRegistrationPath = '/_register';

export const serviceWorkerRoutePropsSchema = z.strictObject({
  httpMethod: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']),
  moduleUrl: z.string().min(1).max(2048),
  routeBaseUrl: z.string().min(1).max(2048),
});

export type ServiceWorkerRouteProps = z.infer<
  typeof serviceWorkerRoutePropsSchema
>;
