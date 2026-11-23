export interface HasEnumeration<TValue> {
  enum: TValue[];
}

export type CanHaveEnumeration<TValue> = Partial<HasEnumeration<TValue>>;
