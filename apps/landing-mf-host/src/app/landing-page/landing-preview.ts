import DOMPurify from 'dompurify';
import { createElement, type ReactElement } from 'react';

export interface LandingPreview {
  renderedSections: ReactElement;
  renderedFooter: ReactElement;
}

type PreviewBlock = 'sections' | 'footer';

export function renderPreviewBlock(
  block: PreviewBlock,
  content: ReactElement,
): ReactElement {
  return createElement('div', { 'data-landing-preview': block }, content);
}

function readPreviewBlock(root: HTMLElement, block: PreviewBlock): ReactElement {
  const element = root.querySelector(`[data-landing-preview="${block}"]`);

  if (!element) {
    throw new Error(`The landing HTML has no ${block} preview.`);
  }

  // Reuse the HTML emitted by the server until this block's client view loads.
  return createElement('div', {
    'data-landing-preview': block,
    'dangerouslySetInnerHTML': {
      __html: DOMPurify.sanitize(element.innerHTML, {
        // Preserve icon focus settings and the footer wordmark's transform range.
        ADD_ATTR: (attributeName, tagName) => (
          (tagName === 'svg' && attributeName === 'focusable')
          || (tagName === 'animatetransform' && ['from', 'to'].includes(attributeName))
        ),
        // Keep leading Emotion styles with the preview markup.
        FORCE_BODY: true,
      }),
    },
  });
}

export function readLandingPreview(root: HTMLElement): LandingPreview {
  return {
    renderedSections: readPreviewBlock(root, 'sections'),
    renderedFooter: readPreviewBlock(root, 'footer'),
  };
}
