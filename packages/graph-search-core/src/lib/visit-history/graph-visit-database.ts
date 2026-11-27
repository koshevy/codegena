import Dexie, { type Table } from 'dexie';

export interface VisitRecord {
  id: string;
  ownerSpecId: string;
  suggestionId: string;
  visitedAt: number;
}

export class GraphVisitDatabase extends Dexie {
  visits!: Table<VisitRecord, string>;

  constructor() {
    super('codegena-graph-visit-history');
    this.version(1).stores({
      visits: 'id, ownerSpecId, visitedAt',
    });
  }
}
