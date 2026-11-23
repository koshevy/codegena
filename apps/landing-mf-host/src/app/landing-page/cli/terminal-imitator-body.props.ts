import type { TerminalImitatorFrame } from './get-terminal-imitator-frame';

export interface TerminalImitatorBodyProps {
  frame: TerminalImitatorFrame;
  greeting: string;
  outputs: readonly string[];
  prompt: string;
}
