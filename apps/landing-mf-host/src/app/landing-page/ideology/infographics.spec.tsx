import { render, screen, within } from '@testing-library/react';

import { Infographics } from './infographics';

describe('Infographics', () => {
  it('presents the five complexity management principles', () => {
    render(<Infographics />);

    const ideology = screen.getByRole('region', {
      name: 'Complexity management',
    });

    expect(within(ideology).getByText('07 / THE IDEOLOGY')).toBeTruthy();
    expect(within(ideology).getAllByRole('listitem')).toHaveLength(5);

    for (const title of [
      'Spec first',
      'Generate',
      'Extend',
      'Explore',
      'Collaborate (soon)',
    ]) {
      expect(within(ideology).getByRole('heading', { name: title })).toBeTruthy();
    }
  });
});
