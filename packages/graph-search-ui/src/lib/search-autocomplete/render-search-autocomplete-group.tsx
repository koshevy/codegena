import type { AutocompleteRenderGroupParams } from '@mui/material/Autocomplete';
import { Children, type ReactNode } from 'react';

export function renderSearchAutocompleteGroup({
  children,
  group,
  key,
}: AutocompleteRenderGroupParams): ReactNode {
  return [
    <li
      className="MuiAutocomplete-groupLabel"
      key={`${key}-label`}
      role="presentation"
    >
      {group}
    </li>,
    ...Children.toArray(children),
  ];
}
