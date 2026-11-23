export function isSameOriginServiceRequest(request: Request, origin: string): boolean {
  const url = new URL(request.url);
  const callerOrigin = request.headers.get('origin');

  return url.origin === origin && (!callerOrigin || callerOrigin === origin);
}
