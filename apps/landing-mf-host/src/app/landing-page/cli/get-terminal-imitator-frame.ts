export interface TerminalImitatorFrame {
  hasGreeting: boolean;
  typedCommand: string;
  visibleOutputCount: number;
}

/**
 * Maps the CLI section's scroll progress to a stable terminal frame.
 */
export function getTerminalImitatorFrame(
  command: string,
  outputCount: number,
  progressPercent: number,
): TerminalImitatorFrame {
  const progress = Math.max(0, Math.min(100, progressPercent));
  const exactTypedLength = command.length * Math.min(progress, 55) / 55;
  const typedLength = Math.floor(exactTypedLength);

  const hasTypo = typedLength > 0
    && typedLength % 83 === 0
    && exactTypedLength - typedLength < 0.5;

  const typoCharacter = command[typedLength]?.toLowerCase() === 'x' ? 'e' : 'x';

  return {
    hasGreeting: progress >= 60,
    typedCommand: command.slice(0, typedLength)
      + (hasTypo ? typoCharacter : ''),
    visibleOutputCount: Math.min(
      outputCount,
      Math.floor(Math.max(0, progress - 60) * outputCount / 32),
    ),
  };
}
