export interface HasRef {
  $ref: string;
}

export type CanHaveRef = Partial<HasRef>;
