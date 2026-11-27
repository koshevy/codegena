import {
  getBlobFullScaleSectionProgress,
  getClosingBlobScale,
} from './blob-growth';

describe('closing feature blob', () => {
  it('starts growing during the final 100px of the IDE section', () => {
    const closingPath = 3.6 * window.innerHeight;

    expect(getClosingBlobScale(0.5 - 120 / closingPath)).toBe(1);
    expect(getClosingBlobScale(0.5 - 80 / closingPath)).toBeGreaterThan(1);
    expect(getClosingBlobScale(0.5)).toBeCloseTo(2);
  });

  it('finishes growth near the start of Unified UI and holds its size', () => {
    const completion = 0.5 + getBlobFullScaleSectionProgress() / 2;

    expect(getClosingBlobScale(completion)).toBeCloseTo(32);
    expect(getClosingBlobScale(1)).toBe(32);
  });
});
