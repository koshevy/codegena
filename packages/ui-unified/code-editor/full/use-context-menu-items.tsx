import type { OnMount } from '@monaco-editor/react';
import { ClipboardPaste, Copy, ListTree } from 'lucide-react';
import { type RefObject, useMemo } from 'react';

import type { ContextMenuItem } from '../../menus/context-menu';

export function useContextMenuItems(
  editorRef: RefObject<Parameters<OnMount>[0] | null>,
  isReadOnly: boolean,
): ContextMenuItem[] {
  return useMemo(() => {
    const copyItem: ContextMenuItem = {
      icon: <Copy aria-hidden />,
      id: 'copy',
      label: 'Copy',
      onSelect: () => {
        const editor = editorRef.current;

        editor?.focus();
        editor?.trigger(
          'code-editor-context-menu',
          'editor.action.clipboardCopyAction',
          null,
        );
      },
    };

    if (isReadOnly) {
      return [copyItem];
    }

    return [
      copyItem,
      {
        icon: <ClipboardPaste aria-hidden />,
        id: 'paste',
        label: 'Paste',
        onSelect: () => {
          const editor = editorRef.current;

          editor?.focus();
          editor?.trigger(
            'code-editor-context-menu',
            'editor.action.clipboardPasteAction',
            null,
          );
        },
      },
      {
        icon: <ListTree aria-hidden />,
        id: 'go-to-symbol',
        label: 'Go to Symbol',
        onSelect: () => {
          const editor = editorRef.current;

          editor?.focus();
          void editor?.getAction('editor.action.quickOutline')?.run();
        },
      },
    ];
  }, [
    editorRef,
    isReadOnly,
  ]);
}
