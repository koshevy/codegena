import type {
  UltimateParserVisitorResultGroup,
} from '@codegena/oas3-core/ultimate-parser';

export function createGraphPayloadIds<
  TAstObject extends object,
  TSourceFileObject extends object,
>(): {
  createItemId: (
    groupId: string,
    name: string | undefined,
    index: number,
  ) => string;
  getGroupId: (
    group: UltimateParserVisitorResultGroup<TSourceFileObject, TAstObject>,
  ) => string;
} {
  type ResultGroup = UltimateParserVisitorResultGroup<
    TSourceFileObject,
    TAstObject
  >;

  const idsByGroup = new Map<ResultGroup, string>();
  const assignedIds = new Set<string>();

  function reserveId(baseId: string): string {
    let id = baseId;
    let occurrence = 1;

    while (assignedIds.has(id)) {
      occurrence += 1;
      id = `${baseId}#${occurrence}`;
    }

    assignedIds.add(id);

    return id;
  }

  function getGroupId(group: ResultGroup): string {
    const existingId = idsByGroup.get(group);

    if (existingId) {
      return existingId;
    }

    const id = reserveId(group.fileName);

    idsByGroup.set(group, id);

    return id;
  }

  function createItemId(
    groupId: string,
    name: string | undefined,
    index: number,
  ): string {
    const identifierName = name || `anonymous-${index + 1}`;
    const baseId = `${groupId}::${identifierName}`;

    return reserveId(baseId);
  }

  return { createItemId, getGroupId };
}
