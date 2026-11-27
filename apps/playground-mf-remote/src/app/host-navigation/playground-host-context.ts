import { createContext } from 'react';

export const PlaygroundHostContext = createContext<(() => void) | undefined>(undefined);
