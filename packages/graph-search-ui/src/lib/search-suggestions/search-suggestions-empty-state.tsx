import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SearchX } from 'lucide-react';
import type { ReactElement } from 'react';

export function SearchSuggestionsEmptyState(): ReactElement {
  return (
    <Box
      aria-label="No search results"
      aria-live="polite"
      role="status"
      sx={{
        alignItems: 'center',
        color: 'text.secondary',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        padding: 2.5,
        textAlign: 'center',
      }}
    >
      <SearchX
        aria-hidden
        size={22}
        strokeWidth={1.5}
      />
      <Typography
        color="text.primary"
        variant="body2"
      >
        No results found
      </Typography>
      <Typography variant="caption">
        Try another file, directory, or declaration name.
      </Typography>
    </Box>
  );
}
