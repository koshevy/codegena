import { createDeterministicSpecId } from '@codegena/graph-search-core';
import { useEffect, useState } from 'react';

interface SpecIdentity {
  id: string;
  text: string;
}

export function useGraphSearchSpecId(
  sourceSchemaText: string,
): string | undefined {
  const [identity, setIdentity] = useState<SpecIdentity>();

  useEffect(() => {
    let isCurrent = true;

    void createDeterministicSpecId(sourceSchemaText).then((id) => {
      if (isCurrent) {
        setIdentity({ id, text: sourceSchemaText });
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [
    sourceSchemaText,
  ]);

  return identity?.text === sourceSchemaText
    ? identity.id
    : undefined;
}
