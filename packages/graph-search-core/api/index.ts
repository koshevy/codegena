import { defineServiceWorkerRoute } from '@codegena/pwa/common';

import { handleGraphSearchRequest } from './handle-graph-search-request';

export default defineServiceWorkerRoute(handleGraphSearchRequest);
