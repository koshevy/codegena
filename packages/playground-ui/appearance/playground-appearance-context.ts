import { createContext } from 'react';

import type { PlaygroundAppearance } from './playground-appearance';

export const PlaygroundAppearanceContext = createContext<PlaygroundAppearance | null>(
  null,
);
