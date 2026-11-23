import { type ReactElement, Suspense } from 'react';
import { useLoaderData, useParams } from 'react-router-dom';

import type { PlaygroundRouteData } from './playground-route-data';
import { PlaygroundSessionStyles } from './playground-session.styles';
import { usePlaygroundKeyboard } from './use-playground-keyboard';
import { usePlaygroundNavigation } from './use-playground-navigation';
import { useAppearance } from '../../appearance';
import { LazyEmbeddedMenu } from '../../menu';
import { getPlaygroundLabel } from '../../playground-examples';
import { ExampleChoices } from '../examples';

export function PlaygroundSession(): ReactElement {
  const {
    mode,
    setMode,
  } = useAppearance();
  const { specUrl } = useParams();

  const {
    specification,
    View,
  } = useLoaderData<PlaygroundRouteData>();

  const {
    handleCloseMenu,
    handleOpenMenu,
    handleReturn,
    handleSelectExample,
    isMenuOpen,
  } = usePlaygroundNavigation();

  const handleEscape = isMenuOpen ? handleCloseMenu : handleReturn;
  const handleKeyDown = usePlaygroundKeyboard(handleEscape);

  const label = getPlaygroundLabel(specUrl);

  const renderedExamples = (
    <ExampleChoices
      onSelect={handleSelectExample}
      selectedSpecUrl={specUrl ?? ''}
    />
  );

  const renderedMenu = isMenuOpen && (
    <Suspense fallback={null}>
      <LazyEmbeddedMenu
        choices={renderedExamples}
        onClose={handleCloseMenu}
        onReturn={handleReturn}
        open={isMenuOpen}
      />
    </Suspense>
  );

  return (
    <PlaygroundSessionStyles
      aria-label={label}
      data-lenis-prevent
      onKeyDown={handleKeyDown}
      role="dialog"
      tabIndex={-1}
    >
      <main aria-label="Specification playground">
        <View
          appearance={{ mode, onModeChange: setMode }}
          onSandwichButtonClick={handleOpenMenu}
          specification={specification}
        />
      </main>
      {renderedMenu}
    </PlaygroundSessionStyles>
  );
}
