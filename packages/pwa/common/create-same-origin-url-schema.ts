import { z } from 'zod';

export function createSameOriginUrlSchema(origin: string): z.ZodType<URL> {
  return z.string().min(1).max(2048).transform((value, context) => {
    if (!URL.canParse(value, origin)) {
      context.addIssue({ code: 'custom', message: 'Invalid URL.' });

      return z.NEVER;
    }

    const url = new URL(value, origin);
    const isAllowed = url.origin === origin
      && ['https:', 'http:'].includes(url.protocol)
      && !url.username && !url.password && !url.hash;

    if (!isAllowed) {
      context.addIssue({ code: 'custom', message: 'A same-origin URL is required.' });

      return z.NEVER;
    }

    return url;
  });
}
