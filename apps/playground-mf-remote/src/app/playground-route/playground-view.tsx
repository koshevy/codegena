import {
  type PlaygroundAppearance,
  PlaygroundAppearanceProvider,
} from '@codegena/playground-ui/appearance';
import CssBaseline from '@mui/material/CssBaseline';
import type { ReactElement } from 'react';

import { SpecificationPlayground } from './specification-playground';
import type { ConvertedSpecification } from '../../services/specification';

export interface PlaygroundViewProps {
  appearance: PlaygroundAppearance;
  onSandwichButtonClick: () => void;
  specification: ConvertedSpecification;
}

/**
 * Render a converted specification inside the embedding app's router.
 */
export function PlaygroundView({
  appearance,
  onSandwichButtonClick,
  specification,
}: PlaygroundViewProps): ReactElement {
  return (
    <PlaygroundAppearanceProvider {...appearance}>
      <CssBaseline />
      <SpecificationPlayground
        onSandwichButtonClick={onSandwichButtonClick}
        specification={specification}
      />
    </PlaygroundAppearanceProvider>
  );
}
