import '@fontsource/jetbrains-mono/400.css';
import type { OnMount } from '@monaco-editor/react';
import clsx from 'clsx';
import {
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useCallback,
  useState,
} from 'react';

import { CodeEditorContextMenu } from './code-editor-context-menu';
import { codeEditorClasses, CodeEditorStyles } from './code-editor.styles';

interface CodeEditorFrameProps {
  children: ReactNode;
  editorRef: RefObject<Parameters<OnMount>[0] | null>;
  height: number | string;
  isPending?: boolean;
  readOnly: boolean;
}

export function CodeEditorFrame({
  children,
  editorRef,
  height,
  isPending = false,
  readOnly,
}: CodeEditorFrameProps): ReactElement {
  const [menuPosition, setMenuPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);

  const handleContextMenu = useCallback((event: MouseEvent<HTMLElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    setMenuPosition({ left: event.clientX, top: event.clientY });
  }, []);

  const handleClose = useCallback((): void => {
    setMenuPosition(null);
  }, []);

  return (
    <CodeEditorStyles
      aria-busy={isPending}
      className={clsx({
        [codeEditorClasses.pending]: isPending,
      })}
      onContextMenu={handleContextMenu}
      sx={{ height, minHeight: 0, overflow: 'hidden' }}
    >
      {children}
      <CodeEditorContextMenu
        editorRef={editorRef}
        onClose={handleClose}
        position={menuPosition}
        readOnly={readOnly}
      />
    </CodeEditorStyles>
  );
}
