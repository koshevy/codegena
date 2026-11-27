import type { MotionStyle } from 'motion/react';
import { div as MotionDiv } from 'motion/react-m';
import type { ReactElement, RefObject } from 'react';

import { artworkClasses, ArtworkStyles } from './artwork.styles';
import { heroEntranceDuration } from './entrance-duration';
import { Logo } from './logo';
import { useArtworkPlacement } from './use-artwork-placement';

interface ArtworkProps {
  animateEntrance: boolean;
  contentRef: RefObject<HTMLDivElement | null>;
  isAnimated: boolean;
  motionStyle?: MotionStyle;
}

const artworkEntranceDelay = 0.2;

export function Artwork({
  animateEntrance,
  contentRef,
  isAnimated,
  motionStyle,
}: ArtworkProps): ReactElement {
  const {
    artworkRef,
    logoY,
  } = useArtworkPlacement(contentRef);

  const initialLogo = animateEntrance ? { opacity: 0, scale: 0.92 } : false;

  return (
    <ArtworkStyles
      ref={artworkRef}
      style={motionStyle}
    >
      <MotionDiv
        animate={{ opacity: 1, scale: 1 }}
        className={artworkClasses.logo}
        initial={initialLogo}
        style={{ top: logoY }}
        transition={{
          delay: artworkEntranceDelay,
          duration: heroEntranceDuration - artworkEntranceDelay,
        }}
      >
        <Logo isAnimated={isAnimated} />
      </MotionDiv>
    </ArtworkStyles>
  );
}
