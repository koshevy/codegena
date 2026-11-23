import {
  FolderStateIcon,
  ProgrammingLanguageIcon,
  resolveProgrammingLanguage,
} from '@codegena/ui-unified/icons';
import type { MotionValue } from 'motion/react';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { codeExample } from './code-example';
import { FolderTree } from './folder-tree';
import { FolderingIllustrationStyles } from './foldering-illustration.styles';
import {
  IllustrationCarousel,
  type IllustrationSlide,
} from '../illustration-carousel';
import { useScrollExpansion } from './use-scroll-expansion';

const codeSlide: IllustrationSlide = {
  description: (
    <>
      Each domain exposes its operations through a local <code>index.ts</code>
      {' '}namespace. Its <code>Lib</code> gathers related types, so callers can
      use short names without collisions or path-shaped identifiers.
    </>
  ),
  fileName: 'items/update-subset-attributes/index.ts',
  icon: (
    <ProgrammingLanguageIcon
      language={resolveProgrammingLanguage('TypeScript')}
      showTooltip={false}
    />
  ),
  kind: 'code',
  source: codeExample,
  tooltipTitle: 'Domain namespace with local type exports',
};

interface FolderingIllustrationProps {
  scrollProgress?: MotionValue<number>;
}

/**
 * Shows generated folder structure and its domain entrypoint.
 */
export function FolderingIllustration({
  scrollProgress,
}: FolderingIllustrationProps): ReactElement {
  const {
    expandedFileIds,
    onExpandedFileIdsChange,
    slideProgress,
  } = useScrollExpansion(scrollProgress);

  const folderSlide = useMemo<IllustrationSlide>(() => ({
    description: (
      <>
        The OnePassword example places widely reused types in <code>_common</code>.
        {' '}The <code>items</code> and <code>vaults</code> domains each have their
        own <code>_common</code> folder, keeping related types close to their use.
      </>
    ),
    fileName: 'oas3-onepassword-connect.json',
    icon: (
      <FolderStateIcon
        isExpanded
        size="1rem"
      />
    ),
    kind: 'folder-tree',
    renderedContent: (
      <FolderTree
        expandedFileIds={expandedFileIds}
        onExpandedFileIdsChange={onExpandedFileIdsChange}
      />
    ),
    tooltipTitle: 'OnePassword generated folder hierarchy',
  }), [
    expandedFileIds,
    onExpandedFileIdsChange,
  ]);

  const slides = useMemo(() => [folderSlide, codeSlide], [folderSlide]);

  return (
    <FolderingIllustrationStyles>
      <IllustrationCarousel
        ariaLabel="OnePassword generated file hierarchy"
        bulletNoun="foldering example"
        scrollProgress={slideProgress}
        slides={slides}
        variant="foldering"
      />
    </FolderingIllustrationStyles>
  );
}
