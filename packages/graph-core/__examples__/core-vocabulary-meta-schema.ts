import { convertFixtureToGraph } from '@codegena/graph-core/testing-utils';

import { readExampleFixture } from './read-example-fixture';

const fixtureName = 'core-vocabulary-meta-schema.jsonc';
const sourceSchemaText = await readExampleFixture(fixtureName);

export const { graph } = await convertFixtureToGraph(fixtureName, {
  mode: 'singleFile',
  sourceSchemaText,
});

export default graph;
