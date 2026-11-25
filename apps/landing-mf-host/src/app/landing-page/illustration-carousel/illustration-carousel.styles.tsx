import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const illustrationCarouselClasses = {
  bulletPlacement: 'IllustrationCarousel__bulletPlacement',
  caption: 'IllustrationCarousel__caption',
  descriptions: 'IllustrationCarousel__descriptions',
} as const;

// language=postcss
export const IllustrationCarouselStyles = styled(Box)`
  & {
    min-width: 0;
  }

  .${illustrationCarouselClasses.caption} {
    padding-top: 2rem;
    position: relative;
  }

  .${illustrationCarouselClasses.descriptions} {
    display: grid;
  }

  .${illustrationCarouselClasses.descriptions} > div {
    grid-area: 1 / 1;
  }

  .${illustrationCarouselClasses.descriptions} > [aria-hidden='true'] {
    visibility: hidden;
  }

  .${illustrationCarouselClasses.bulletPlacement} {
    left: 50%;
    position: absolute;
    top: 0.25rem;
    transform: translateX(-50%);
  }

  @media (max-width: 700px) {
    & {
      --landing-code-editor-height: 30svh;
      display: flex;
      flex-direction: column;
    }

    .${illustrationCarouselClasses.caption} {
      margin-bottom: 1rem;
    }

    &[data-variant='code'] .${illustrationCarouselClasses.descriptions}
    > [aria-hidden='true'] {
      display: none;
    }

    &[data-variant='foldering'] {
      height: 100%;
    }
  }
`;
