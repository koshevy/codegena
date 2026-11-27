import { defineServiceWorkerRoute } from '@codegena/pwa/common';

import { createSpecificationApi } from './create-specification-api';
import { convertSpecification } from './execution';

export default defineServiceWorkerRoute(
  createSpecificationApi(globalThis.location.origin, convertSpecification),
);
