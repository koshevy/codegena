/**
 * Examples are JSON Schema annotations, not OpenAPI Example Objects.
 */
export interface HasExamples<TValue = unknown> {
  examples: TValue[];
}

export type CanHaveExamples<TValue = unknown> = Partial<HasExamples<TValue>>;
