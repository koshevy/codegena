export interface HasItems {
    additionalItems: boolean;
    maxItems: number;
    minItems: number;
    uniqueItems: boolean;
}

// contains — new in draft 6, see https://bit.ly/3baVqJE
export type ContainsItems<TItemSchema> =
    | { items: TItemSchema | TItemSchema[]; contains: never }
    | { contains: TItemSchema; items: never; }
    ;
