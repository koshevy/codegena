export interface HasDescription {
  title: string;
  description: string;
}

export type CanHaveDescription = Partial<HasDescription>;
