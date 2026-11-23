export interface HasDefault<TValue = unknown> {
  default: TValue;
}

export type CanHaveDefault<TValue = unknown> = Partial<
  HasDefault<TValue>
>;
