import {
  PlaygroundAppearanceProvider,
  type PlaygroundAppearance,
} from '@codegena/playground-ui/appearance';
import CssBaseline from '@mui/material/CssBaseline';
import type { ReactElement } from 'react';
import { RouterProvider } from 'react-router-dom';

import { useAppAppearance } from './appearance';
import { PlaygroundHostContext } from './host-navigation';
import type { createAppRouter } from './routing';

export interface AppProps {
  appearance?: PlaygroundAppearance;
  onSandwichButtonClick?: () => void;
  router: ReturnType<typeof createAppRouter>;
}

export function App({
  appearance,
  onSandwichButtonClick,
  router,
}: AppProps): ReactElement {
  const {
    mode,
    onModeChange,
  } = useAppAppearance(appearance);

  return (
    <PlaygroundAppearanceProvider
      mode={mode}
      onModeChange={onModeChange}
    >
      <CssBaseline />
      <PlaygroundHostContext.Provider value={onSandwichButtonClick}>
        <RouterProvider router={router} />
      </PlaygroundHostContext.Provider>
    </PlaygroundAppearanceProvider>
  );
}

export default App;
