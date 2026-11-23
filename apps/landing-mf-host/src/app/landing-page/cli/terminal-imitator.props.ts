export interface TerminalImitatorProps {
  command: string;
  greeting: string;
  outputs: readonly string[];
  progressPercent: number;
  prompt: string;
}
