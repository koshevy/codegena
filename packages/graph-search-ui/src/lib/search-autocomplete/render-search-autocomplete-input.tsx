import type { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { Search } from 'lucide-react';
import type { ReactElement, Ref } from 'react';

interface RenderSearchAutocompleteInputProps {
  inputRef?: Ref<HTMLInputElement>;
  onBlur: () => void;
  params: AutocompleteRenderInputParams;
  placeholder: string;
}

export function renderSearchAutocompleteInput({
  inputRef,
  onBlur,
  params,
  placeholder,
}: RenderSearchAutocompleteInputProps): ReactElement {
  const { InputProps, inputProps, ...textFieldProps } = params;

  return (
    <TextField
      {...textFieldProps}
      autoFocus
      fullWidth
      inputRef={inputRef}
      onBlur={onBlur}
      InputProps={{
        ...InputProps,
        inputProps: {
          ...inputProps,
          'aria-label': [
            'Search generated files, directories, declarations,',
            'specification, and warnings',
          ].join(' '),
        },
        startAdornment: (
          <InputAdornment position="start">
            <Search
              aria-hidden
              size={19}
            />
          </InputAdornment>
        ),
      }}
      placeholder={placeholder}
      variant="outlined"
    />
  );
}
