import { createContext } from 'react';

export type GraphSearchReadiness = 'ready' | 'unavailable';

/**
 * Lets a host start the search API while its views render. Resolve unavailable
 * to use local search. Without a provider, the client connects directly.
 */
export const GraphSearchReadinessContext = createContext<
  Promise<GraphSearchReadiness> | null
>(null);
