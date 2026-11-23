import Ansi from 'ansi-to-react';
import type { ReactElement } from 'react';

import type { TerminalImitatorBodyProps } from './terminal-imitator-body.props';
import {
  terminalImitatorBodyClasses,
  TerminalImitatorBodyStyles,
} from './terminal-imitator-body.styles';

export function TerminalImitatorBody({
  frame: { hasGreeting, typedCommand, visibleOutputCount },
  greeting,
  outputs,
  prompt,
}: TerminalImitatorBodyProps): ReactElement {
  const hasFinished = visibleOutputCount === outputs.length;

  const renderedGreeting = hasGreeting && (
    <pre
      aria-label="Codegena CLI greeting"
      className={terminalImitatorBodyClasses.greeting}
      role="img"
    >
      <Ansi useClasses>{greeting}</Ansi>
    </pre>
  );

  const renderedOutputs = outputs.slice(0, visibleOutputCount).map((output) => (
    <pre
      className={terminalImitatorBodyClasses.output}
      key={output}
    >
      <Ansi useClasses>{output}</Ansi>
    </pre>
  ));

  const renderedFinalPrompt = hasFinished && (
    <div className={terminalImitatorBodyClasses.prompt}>
      {prompt}
      <span
        aria-hidden
        className={terminalImitatorBodyClasses.cursor}
      />
    </div>
  );

  const renderedPromptName = (
    <span className={terminalImitatorBodyClasses.promptName}>{prompt}</span>
  );

  const renderedTypingCursor = !hasFinished && (
    <span
      aria-hidden
      className={terminalImitatorBodyClasses.cursor}
    />
  );

  const renderedCommandLine = (
    <div className={terminalImitatorBodyClasses.prompt}>
      {renderedPromptName}
      {' '}
      {typedCommand}
      {renderedTypingCursor}
    </div>
  );

  return (
    <TerminalImitatorBodyStyles>
      {renderedCommandLine}
      {renderedGreeting}
      {renderedOutputs}
      {renderedFinalPrompt}
    </TerminalImitatorBodyStyles>
  );
}
