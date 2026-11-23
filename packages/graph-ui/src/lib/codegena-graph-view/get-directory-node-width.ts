const chromeWidth = 96;
const estimatedTitleCharacterWidth = 9;
const estimatedDescriptionCharacterWidth = 6;
const maximumWidth = 280;

/** Reserve space for the icons and size both text rows up to 280px. */
export function getDirectoryNodeWidth(
  label: string,
  description: string,
): number {
  const titleWidth = label.length * estimatedTitleCharacterWidth;
  const descriptionWidth = description.length * estimatedDescriptionCharacterWidth;

  return Math.min(maximumWidth, chromeWidth + Math.max(titleWidth, descriptionWidth));
}
