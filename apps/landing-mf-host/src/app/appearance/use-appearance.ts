import { useContext } from 'react';

import { type Appearance, AppearanceContext } from './appearance-context';

export function useAppearance(): Appearance {
  const appearance = useContext(AppearanceContext);

  if (!appearance) {
    throw new Error('useAppearance needs an AppearanceProvider.');
  }

  return appearance;
}
