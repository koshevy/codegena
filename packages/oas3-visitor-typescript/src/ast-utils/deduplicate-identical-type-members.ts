import type { TypeNode } from 'typescript';

import { getPrintedTypeNodeText } from './get-printed-type-node-text';

/** Keeps the first occurrence of each identically rendered type. */
export function deduplicateIdenticalTypeMembers(
  memberTypes: TypeNode[],
): TypeNode[] {
  const seen = new Set<string>();

  return memberTypes.filter((memberType) => {
    const typeText = getPrintedTypeNodeText(memberType);

    if (seen.has(typeText)) {
      return false;
    }

    seen.add(typeText);

    return true;
  });
}
