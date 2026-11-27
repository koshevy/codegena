import type { SyntheticEvent } from 'react';

export function stopPropagation(event: SyntheticEvent<HTMLElement>): void {
  event.stopPropagation();
}
