import { cliTraits } from './cli/cli-traits';
import { dataEngineTraits } from './data-engine/data-engine-traits';
import { folderingTraits } from './foldering/foldering-traits';
import { idePluginsTraits } from './ide-plugins/ide-plugins-traits';
import { jsonSchemaTraits } from './json-schema/json-schema-traits';
import { unifiedUiTraits } from './unified-ui/unified-ui-traits';

export const unifiedUiStepIndex = 5;

export const featureSteps = [
  jsonSchemaTraits,
  cliTraits,
  folderingTraits,
  dataEngineTraits,
  idePluginsTraits,
  unifiedUiTraits,
] as const;
