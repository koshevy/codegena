/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';

import { readLandingPreview } from './landing-preview';

describe('readLandingPreview', () => {
  it('keeps the server preview content while stripping executable attributes', () => {
    const root = document.createElement('div');
    const sections = document.createElement('div');
    const footer = document.createElement('div');
    const heading = document.createElement('h2');
    const styles = document.createElement('style');
    const svgNamespace = 'http://www.w3.org/2000/svg';
    const wordmark = document.createElementNS(svgNamespace, 'svg');
    const transform = document.createElementNS(svgNamespace, 'animateTransform');

    sections.dataset['landingPreview'] = 'sections';
    footer.dataset['landingPreview'] = 'footer';
    heading.textContent = 'Feature preview';
    heading.setAttribute('onclick', 'return false');
    styles.dataset['emotion'] = 'codegena wordmark';
    styles.textContent = '.wordmark { display: block }';
    wordmark.setAttribute('focusable', 'false');
    transform.setAttribute('from', '0 0');
    transform.setAttribute('to', '1206 0');
    wordmark.append(transform);
    sections.append(heading);
    footer.append(styles, wordmark);
    root.append(sections, footer);

    const { renderedSections, renderedFooter } = readLandingPreview(root);
    const footerPreview = render(renderedFooter).container.firstElementChild;
    const { getByRole } = render(renderedSections);

    expect(getByRole('heading', { name: 'Feature preview' }).hasAttribute('onclick'))
      .toBe(false);
    expect(footerPreview?.innerHTML).toBe(footer.innerHTML);
  });
});
