import type { SeparatedGroupPlan } from '../plan-separated-groups';

export interface BarrelPlan {
  fileName: string;
  sourceGroups: SeparatedGroupPlan[];
  operationFiles: string[];
}
