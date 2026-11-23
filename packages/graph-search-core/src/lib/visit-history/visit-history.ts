import type {
  GraphPayload,
  GraphPayloadLog,
  GraphPayloadNode,
} from '@codegena/graph-core';
import { liveQuery } from 'dexie';

import { GraphVisitDatabase, type VisitRecord } from './graph-visit-database';

const database = typeof indexedDB === 'undefined'
  ? undefined
  : new GraphVisitDatabase();

/**
 * Keeps a specification's recent visits in memory and syncs them via Dexie.
 */
export class VisitHistory {
  private readonly listeners = new Set<() => void>();
  private version = 0;
  private recentIds: string[] = [];
  private visitRanks = new Map<string, number>();
  private subscription?: { unsubscribe: () => void };

  constructor(
    private readonly graphPayload: GraphPayload,
    readonly ownerSpecId: string,
  ) {}

  /**
   * Start syncing persisted visits after the owner is active.
   */
  start(): void {
    if (!database || this.subscription) {
      return;
    }

    const activeDatabase = database;

    this.subscription = liveQuery(() => (
      activeDatabase.visits.where('ownerSpecId').equals(this.ownerSpecId).toArray()
    )).subscribe((records) => {
      this.setRecords(records);
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  }

  getRecentSuggestionIds(limit: number): string[] {
    return this.recentIds.slice(0, limit);
  }

  getVisitRank(suggestionId: string): number {
    return this.visitRanks.get(suggestionId) ?? 0;
  }

  getVersion(): number {
    return this.version;
  }

  onGraphPayloadNodeVisited(node: GraphPayloadNode): void {
    const isKnownNode = this.graphPayload.nodes.some(({ id }) => id === node.id);

    if (isKnownNode) {
      this.recordVisit(`node:${node.id}`);
    }
  }

  onGraphPayloadLogVisited(log: GraphPayloadLog): void {
    const index = this.graphPayload.logs.indexOf(log);

    if (index !== -1) {
      this.recordVisit(`warning:${index}`);
    }
  }

  dispose(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
    this.listeners.clear();
  }

  private recordVisit(suggestionId: string): void {
    const record: VisitRecord = {
      id: crypto.randomUUID(),
      ownerSpecId: this.ownerSpecId,
      suggestionId,
      visitedAt: Date.now(),
    };

    this.setRecentIds([suggestionId, ...this.recentIds]);
    void database?.visits.add(record);
  }

  private setRecords(records: VisitRecord[]): void {
    const sorted = records.toSorted((left, right) => (
      right.visitedAt - left.visitedAt
    ));

    this.setRecentIds(sorted.map(({ suggestionId }) => suggestionId));
  }

  private setRecentIds(ids: string[]): void {
    this.recentIds = [...new Set(ids)];
    this.visitRanks = new Map(this.recentIds.map((id, index) => [
      id,
      1 / (index + 1),
    ]));
    this.version += 1;
    this.listeners.forEach((listener) => listener());
  }
}
