import { FileDetailsHeader } from '@codegena/ui-unified/files';
import { ThemedScrollAreaStyles } from '@codegena/ui-unified/scrolling';
import '@fontsource/ubuntu-mono/400.css';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SquareTerminal } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactElement } from 'react';
import { createPortal } from 'react-dom';

import type { TerminalImitatorProps } from './terminal-imitator.props';
import { IllustrationCaption } from '../illustration-caption';
import {
  PeelDrawer,
  usePeelDrawer,
} from '../peel-drawer';
import { getTerminalImitatorFrame } from './get-terminal-imitator-frame';
import { TerminalImitatorBody } from './terminal-imitator-body';
import {
  terminalImitatorClasses,
  TerminalImitatorStyles,
} from './terminal-imitator.styles';
import { useTerminalImitatorViewport } from './use-terminal-imitator-viewport';

/**
 * Illustrates the CLI's command, greeting, and diagnostics in sequence.
 */
export function TerminalImitator({
  command,
  greeting,
  outputs,
  progressPercent,
  prompt,
}: TerminalImitatorProps): ReactElement {
  const isNarrow = useMediaQuery('(max-width: 700px)');

  const {
    handleClose,
    handleDrawerContentRef,
    handleOpen,
    isOpen,
    portalHost,
    previewRef,
  } = usePeelDrawer();

  const frame = getTerminalImitatorFrame(
    command,
    outputs.length,
    progressPercent,
  );

  const {
    contentRef,
    handleScroll,
    scrollHostRef,
  } = useTerminalImitatorViewport(frame);

  const handleHeaderSelect = isOpen ? handleClose : handleOpen;

  const toggleLabel = isNarrow
    ? `${isOpen ? 'Collapse' : 'Expand'} CLI terminal`
    : undefined;

  const renderedHeader = (
    <div className={terminalImitatorClasses.header}>
      <FileDetailsHeader
        ariaExpanded={isNarrow ? isOpen : undefined}
        ariaLabel={toggleLabel}
        icon={(
          <SquareTerminal
            aria-hidden
            size={16}
            strokeWidth={1.5}
          />
        )}
        name="codegena — terminal"
        onSelect={isNarrow ? handleHeaderSelect : undefined}
      />
    </div>
  );

  const renderedWindow = (
    <motion.div
      className={terminalImitatorClasses.window}
      layout
      layoutId={isNarrow ? 'landing-playground-terminal' : undefined}
    >
      {renderedHeader}
      <ThemedScrollAreaStyles
        className={terminalImitatorClasses.scrollHost}
        ref={scrollHostRef}
      >
        <div
          aria-label="Simulated CLI output"
          className={terminalImitatorClasses.content}
          onScroll={handleScroll}
          ref={contentRef}
          role="region"
          tabIndex={0}
        >
          <TerminalImitatorBody
            frame={frame}
            greeting={greeting}
            outputs={outputs}
            prompt={prompt}
          />
        </div>
      </ThemedScrollAreaStyles>
    </motion.div>
  );

  const renderedCaption = (
    <IllustrationCaption className={terminalImitatorClasses.caption}>
      This is an artistic terminal preview, not a live session. Replace the
      sample path and run the CLI in your terminal, or ask your AI assistant
      to run it for you.
    </IllustrationCaption>
  );

  const renderedPreview = <div ref={previewRef} />;

  const renderedDrawer = isNarrow && (
    <PeelDrawer
      ariaLabel="CLI terminal output"
      contentRef={handleDrawerContentRef}
      onClose={handleClose}
      open={isOpen}
    />
  );

  const renderedPortal = createPortal(
    <TerminalImitatorStyles data-drawer={isOpen ? 'true' : undefined}>
      {renderedWindow}
    </TerminalImitatorStyles>,
    portalHost,
  );

  return (
    <TerminalImitatorStyles
      aria-label="CLI terminal illustration"
      role="region"
    >
      {renderedPreview}
      {renderedCaption}
      {renderedDrawer}
      {renderedPortal}
    </TerminalImitatorStyles>
  );
}
