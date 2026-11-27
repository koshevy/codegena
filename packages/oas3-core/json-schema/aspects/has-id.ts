export interface HasId {
  $id: string;
}

export type CanHaveId = Partial<HasId>;
