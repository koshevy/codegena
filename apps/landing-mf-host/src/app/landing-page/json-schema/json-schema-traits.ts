import type { FeatureTraits } from '../feature-story';

export const jsonSchemaTraits: FeatureTraits = {
  documentationHref: '/docs/core-features#schema-interpretation',
  description: [
    'Codegena resolves related JSON Schema parts together, including',
    'string patterns, recursive and circular references, conditions,',
    'and anyOf/oneOf/allOf.',
    'It follows their dependencies to produce coherent TypeScript,',
    'choosing interfaces, named or inline types, and shared declarations',
    'where each fits best.',
  ].join(' '),
  emphasis: 'support',
  kicker: '01 / JSON SCHEMA',
  subject: 'JSON Schema',
  title: 'Most detailed',
};
