import { z } from 'zod';

export const serviceWorkerRouteHeadersSchema = z.array(z.tuple([z.string(), z.string()]));
