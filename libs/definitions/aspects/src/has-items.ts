export interface HasItems {
    additionalItems: boolean;
    maxItems: number;
    minItems: number;
    uniqueItems: boolean;
}

export type ContainsItems<TItem> = | { items: TItem | TItem[]; }
                                   // new in draft 6, see https://bit.ly/3baVqJE
                                   | { contains: TItem; };
