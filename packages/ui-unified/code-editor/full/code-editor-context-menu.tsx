import type { OnMount } from '@monaco-editor/react';
import type { ReactElement, RefObject } from 'react';

import { useContextMenuItems } from './use-context-menu-items';
import { ContextMenu } from '../../menus/context-menu';

export interface CodeEditorContextMenuProps {
  editorRef: RefObject<Parameters<OnMount>[0] | null>;
  onClose: () => void;
  position: { left: number; top: number } | null;
  readOnly: boolean;
}

export function CodeEditorContextMenu({
  editorRef,
  onClose,
  position,
  readOnly,
}: CodeEditorContextMenuProps): ReactElement {
  const items = useContextMenuItems(editorRef, readOnly);

  return (
    <ContextMenu
      ariaLabel="Code editor actions"
      disableEnforceFocus
      disableRestoreFocus
      items={items}
      onClose={onClose}
      position={position}
    />
  );
}
