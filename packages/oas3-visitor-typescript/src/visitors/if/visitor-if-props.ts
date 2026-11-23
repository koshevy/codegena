import type { ConditionalTransitiveNode } from '@codegena/oas3-core/transitive-node';

import type { VisitorFnProps } from '../../typescript-parser-visitor-fn';

export interface VisitorIfProps extends Omit<VisitorFnProps, 'transitiveNode'> {
  transitiveNode: ConditionalTransitiveNode;
}
