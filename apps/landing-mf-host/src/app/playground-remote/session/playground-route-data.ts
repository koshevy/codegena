import type {
  ConvertedSpecification,
  PlaygroundViewProps,
} from 'playground-mf-remote/App';
import type { ComponentType } from 'react';

export interface PlaygroundRouteData {
  specification: ConvertedSpecification;
  View: ComponentType<PlaygroundViewProps>;
}
