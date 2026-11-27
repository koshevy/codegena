import { getTerminalImitatorFrame } from './get-terminal-imitator-frame';

const command = 'npx oas3ts convert';

describe('getTerminalImitatorFrame', () => {
  it('shows command typing according to scroll progress', () => {
    expect(getTerminalImitatorFrame(command, 2, 0)).toEqual({
      hasGreeting: false,
      typedCommand: '',
      visibleOutputCount: 0,
    });
    expect(getTerminalImitatorFrame(command, 2, 20).typedCommand)
      .toBe(command.slice(0, 6));
    expect(getTerminalImitatorFrame(command, 2, 60)).toEqual({
      hasGreeting: true,
      typedCommand: command,
      visibleOutputCount: 0,
    });
  });

  it('reveals diagnostics only at their scroll positions', () => {
    expect(getTerminalImitatorFrame(command, 2, 85).visibleOutputCount)
      .toBe(1);
    expect(getTerminalImitatorFrame(command, 2, 99).visibleOutputCount)
      .toBe(2);
    expect(getTerminalImitatorFrame(command, 2, 60).visibleOutputCount)
      .toBe(0);
  });

  it('clamps scroll progress outside the CLI section', () => {
    expect(getTerminalImitatorFrame(command, 2, -10).typedCommand)
      .toBe('');
    expect(getTerminalImitatorFrame(command, 2, 150).visibleOutputCount)
      .toBe(2);
  });
});
