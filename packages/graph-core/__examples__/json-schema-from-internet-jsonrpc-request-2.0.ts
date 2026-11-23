import { convertFixtureToGraph } from '@codegena/graph-core/testing-utils';

import { readExampleFixture } from './read-example-fixture';

const fixtureName = 'json-schema-from-internet-jsonrpc-request-2.0.jsonc';
const sourceSchemaText = await readExampleFixture(fixtureName);

export const { graph } = await convertFixtureToGraph(fixtureName, { sourceSchemaText });

export default graph;
