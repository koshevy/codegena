import {
  cliEnd,
  cliStart,
  closingSequenceStart,
  folderingEnd,
  unifiedUiStart,
} from '../feature-story';

const searchEnd = closingSequenceStart;

export function getActiveStep(progress: number): number {
  if (progress < cliStart) {
    return 0;
  }

  if (progress < cliEnd) {
    return 1;
  }

  if (progress < folderingEnd) {
    return 2;
  }

  if (progress < searchEnd) {
    return 3;
  }

  return progress < unifiedUiStart ? 4 : 5;
}

export function getTerminalProgressPercent(progress: number): number {
  const cliProgress = (progress - cliStart) / (cliEnd - cliStart);

  return Math.round(Math.max(0, Math.min(100, cliProgress * 100)));
}

export function getSectionProgress(progress: number): number {
  if (progress < cliStart) {
    return Math.max(0, progress / cliStart);
  }

  if (progress < cliEnd) {
    return (progress - cliStart) / (cliEnd - cliStart);
  }

  if (progress < folderingEnd) {
    return (progress - cliEnd) / (folderingEnd - cliEnd);
  }

  if (progress < searchEnd) {
    return (progress - folderingEnd) / (searchEnd - folderingEnd);
  }

  if (progress < unifiedUiStart) {
    return (progress - searchEnd) / (unifiedUiStart - searchEnd);
  }

  return Math.min(1, (progress - unifiedUiStart) / (
    1 - unifiedUiStart
  ));
}

export function getBlobProgress(progress: number): number {
  if (progress < searchEnd) {
    return getSectionProgress(progress);
  }

  return Math.min(1, (progress - searchEnd) / (1 - searchEnd));
}

export function getFolderingProgress(progress: number): number {
  return Math.max(0, Math.min(1, (progress - cliEnd) / (folderingEnd - cliEnd)));
}
