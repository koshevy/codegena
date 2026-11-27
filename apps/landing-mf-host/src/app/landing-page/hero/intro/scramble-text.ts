const scrambleCharacters = '#$%&░@▒▋▓€ƒŠŽ¢£¥§¶Ø';

export interface TextSegment {
  kind: 'opening' | 'scramble' | 'idea';
  startIndex: number;
  text: string;
}

/**
 * Reveals the new text from its center as the scroll progress advances.
 */
export function scrambleText(
  from: string,
  to: string,
  progress: number,
): TextSegment[] {
  if (progress <= 0) {
    return [{ kind: 'opening', startIndex: 0, text: from }];
  }

  if (progress >= 1) {
    return [{ kind: 'idea', startIndex: 0, text: to }];
  }

  const length = Math.max(from.length, to.length);
  const center = (length - 1) / 2;
  const frame = Math.floor(progress * 40);

  const characters = Array.from({ length }, (_, index): TextSegment => {
    const distanceFromCenter = Math.abs(index - center) / center;
    const start = distanceFromCenter * 0.65;
    const characterProgress = (progress - start) / 0.35;

    if (characterProgress <= 0) {
      return { kind: 'opening', startIndex: index, text: from[index] ?? '' };
    }

    if (characterProgress >= 1) {
      return { kind: 'idea', startIndex: index, text: to[index] ?? '' };
    }

    if (from[index] === ' ' && to[index] === ' ') {
      return { kind: 'scramble', startIndex: index, text: ' ' };
    }

    const shuffledPosition = Math.abs(Math.sin(
      (index + 1) * (frame + 1) * 73.113,
    ));

    const character = scrambleCharacters[
      Math.floor(shuffledPosition * scrambleCharacters.length)
    ];

    return { kind: 'scramble', startIndex: index, text: character };
  });

  return characters.reduce<TextSegment[]>((segments, character) => {
    const previous = segments.at(-1);

    if (previous?.kind === character.kind) {
      previous.text += character.text;
      return segments;
    }

    segments.push(character);
    return segments;
  }, []);
}
