import type {
  GraphPayload,
  GraphPayloadLog,
  GraphPayloadSourceLocation,
} from '@codegena/graph-core';
import { useCopyTextWithNotification } from '@codegena/playground-ui/clipboard';
import { JsonEditor } from '@codegena/playground-ui/json-editor';
import { PanelBody, PanelHeader, PanelToggle } from '@codegena/ui-unified/panels';
import type { OnMount } from '@monaco-editor/react';
import Typography from '@mui/material/Typography';
import { Braces } from 'lucide-react';
import { type ReactElement, useCallback, useRef, useState } from 'react';

import { PlaygroundSourceSchemaCopyButton } from './playground-source-schema-copy-button';
import { PlaygroundSourceSchemaSkeleton } from './playground-source-schema-skeleton';
import {
  PlaygroundSourceSchemaBodyStyles,
} from './playground-source-schema.styles';
import { useContextMenuItems } from './use-context-menu-items';

interface PlaygroundSourceSchemaProps {
  graph: GraphPayload;
  navigationTarget?: GraphPayloadSourceLocation;
  onHide: () => void;
  onRevealNode: (nodeId: string) => void;
  onRevealWarning: (log: GraphPayloadLog) => void;
  sourceSchemaText: string;
  visible: boolean;
}

export function PlaygroundSourceSchema({
  graph,
  navigationTarget,
  onHide,
  onRevealNode,
  onRevealWarning,
  sourceSchemaText,
  visible,
}: PlaygroundSourceSchemaProps): ReactElement {
  const contextMenuItems = useContextMenuItems(onHide);
  const copyText = useCopyTextWithNotification();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const [isEditorMounted, setIsEditorMounted] = useState(false);

  const handleEditorMount = useCallback<OnMount>((editor) => {
    editorRef.current = editor;
    setIsEditorMounted(true);
  }, []);

  const handleCopySchema = useCallback((): void => {
    const text = editorRef.current?.getValue() ?? sourceSchemaText;

    void copyText({
      failureMessage: 'Could not copy source schema',
      successMessage: 'Source schema copied',
      text,
    });
  }, [
    copyText,
    sourceSchemaText,
  ]);

  const hasToShowSkeleton = visible && !isEditorMounted;
  const renderedSkeleton = hasToShowSkeleton && (
    <PlaygroundSourceSchemaSkeleton />
  );

  return (
    <>
      <PanelHeader
        contextMenuItems={contextMenuItems}
        actions={(
          <>
            <Typography
              color="text.secondary"
              variant="caption"
            >
              JSON
            </Typography>
            <PlaygroundSourceSchemaCopyButton onClick={handleCopySchema} />
            <PanelToggle
              isOpen={visible}
              isVisible
              onToggle={onHide}
              position="left"
              title="source schema"
            />
          </>
        )}
        icon={(
          <Braces
            aria-hidden
            size={18}
          />
        )}
        title="Source schema"
      />
      <PanelBody>
        <PlaygroundSourceSchemaBodyStyles>
          <JsonEditor
            graph={graph}
            navigationTarget={navigationTarget}
            onMount={handleEditorMount}
            onRevealNode={onRevealNode}
            onRevealWarning={onRevealWarning}
            sourceSchemaText={sourceSchemaText}
            visible={visible}
          />
          {renderedSkeleton}
        </PlaygroundSourceSchemaBodyStyles>
      </PanelBody>
    </>
  );
}
