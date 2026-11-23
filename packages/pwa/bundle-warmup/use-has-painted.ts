import { useEffect, useMemo, useState } from 'react';

export function useHasPainted(key: string): boolean {
  const paintRequest = useMemo(() => Symbol(key), [key]);
  const [paintedRequest, setPaintedRequest] = useState<symbol>();

  useEffect(() => {
    let frame = requestAnimationFrame(() => {
      // Leave a frame for the current view before starting background work.
      frame = requestAnimationFrame(() => setPaintedRequest(paintRequest));
    });

    return () => cancelAnimationFrame(frame);
  }, [paintRequest]);

  return paintedRequest === paintRequest;
}
