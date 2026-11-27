export { dataEngineTraits } from './data-engine-traits';

export function loadSearchPreview(): Promise<typeof import('./search-illustration')> {
  return import(
    /* webpackChunkName: "landing-search-preview" */
    './search-illustration'
  );
}
