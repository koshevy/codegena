import type { GraphSearchSource } from '@codegena/graph-search-core';
import { SearchDrawer, SearchSuggestionsSourceProvider } from '@codegena/graph-search-ui';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import type { MotionValue } from 'motion/react';
import type { ReactElement } from 'react';

import { ClickCue } from '../click-cue';
import {
  searchIllustrationClasses,
  SearchIllustrationStyles,
} from './search-illustration.styles';
import { useSearch } from '../demo-search';
import { Orbit } from '../orbit';

interface SearchIllustrationProps {
  orbitAngle: MotionValue<number>;
  searchSource: GraphSearchSource;
}

/**
 * Opens the real graph search over the GitHub REST API fixture.
 */
export function SearchIllustration({
  orbitAngle,
  searchSource,
}: SearchIllustrationProps): ReactElement {
  const {
    handleClose,
    handleOpen,
    isOpen,
  } = useSearch();

  const renderedSearchIcon = <SearchIcon aria-hidden />;

  return (
    <SearchIllustrationStyles>
      <Orbit
        angle={orbitAngle}
        phrase="Click to try out the search"
        repetitions={4}
      />
      <div className={searchIllustrationClasses.action}>
        <Button
          onClick={handleOpen}
          startIcon={renderedSearchIcon}
          variant="contained"
        >
          Try searching GitHub’s API
        </Button>
        <ClickCue />
      </div>
      <SearchSuggestionsSourceProvider source={searchSource}>
        <SearchDrawer
          onAutocompleteSelect={handleClose}
          onClose={handleClose}
          open={isOpen}
          placeholder={'Try something like "PublicEvent"'}
        />
      </SearchSuggestionsSourceProvider>
    </SearchIllustrationStyles>
  );
}
