import type {
  GraphPayloadGroupNode,
  GraphPayloadItemNode,
  GraphPayloadSourceLocation,
} from '@codegena/graph-core';
import { useCopyTextWithNotification } from '@codegena/playground-ui/clipboard';
import { downloadTextFile } from '@codegena/playground-ui/download-files';
import {
  type CodeEditorGlyph,
  GeneratedCodeEditor,
} from '@codegena/ui-unified/code-editor';
import { FileDetailsHeader } from '@codegena/ui-unified/files';
import {
  ProgrammingLanguageIcon,
  resolveProgrammingLanguage,
} from '@codegena/ui-unified/icons';
import clsx from 'clsx';
import { Copy, Download } from 'lucide-react';
import {
  type ReactElement,
  type MouseEvent,
  type Ref,
  useCallback,
  useMemo,
} from 'react';

import { GeneratedFileDeclarationGlyph } from './generated-file-declaration-glyph';
import {
  GeneratedFileDetailsFileActionButton,
} from './generated-file-details-file-action-button';
import {
  generatedFileDetailsFileClasses,
  GeneratedFileDetailsFileStyles,
} from './generated-file-details-file.styles';

const emptyDeclarations: GraphPayloadItemNode[] = [];

interface GeneratedFileDetailsFileProps {
  declarations?: GraphPayloadItemNode[];
  editorHeight: number;
  file: GraphPayloadGroupNode;
  isOnlyFile: boolean;
  isScrolling: boolean;
  isSelected: boolean;
  onNavigateToSource?: (
    location: GraphPayloadSourceLocation,
    generatedDeclarationId?: string,
  ) => void;
  onSelectFile?: (fileId: string, isShiftSelection: boolean) => void;
  ref?: Ref<HTMLDivElement>;
  selectedLine?: number;
}

export function GeneratedFileDetailsFile({
  declarations = emptyDeclarations,
  editorHeight,
  file,
  isOnlyFile,
  isScrolling,
  isSelected,
  onNavigateToSource,
  onSelectFile,
  ref,
  selectedLine,
}: GeneratedFileDetailsFileProps): ReactElement {
  const programmingLanguage = file.data.programmingLanguage ?? 'TypeScript';
  const copyText = useCopyTextWithNotification();

  const glyphs = useMemo<CodeEditorGlyph[]>(() => (
    declarations.flatMap((item): CodeEditorGlyph[] => {
      const { line } = item.data;

      if (line === undefined) {
        return [];
      }

      return [{
        content: (
          <GeneratedFileDeclarationGlyph
            item={item}
            onNavigateToSource={onNavigateToSource}
          />
        ),
        line,
      }];
    })
  ), [
    declarations,
    onNavigateToSource,
  ]);

  const handleCopyFile = useCallback((): void => {
    void copyText({
      failureMessage: `Could not copy ${file.data.fileName}`,
      successMessage: `${file.data.fileName} copied`,
      text: file.data.text,
    });
  }, [
    copyText,
    file.data.fileName,
    file.data.text,
  ]);

  const handleDownloadFile = useCallback((): void => {
    downloadTextFile(file.data.fileName, file.data.text);
  }, [
    file.data.fileName,
    file.data.text,
  ]);

  const handleSelectFile = useCallback((
    event: MouseEvent<HTMLButtonElement>,
  ): void => {
    onSelectFile?.(file.id, event.shiftKey);
  }, [
    file.id,
    onSelectFile,
  ]);

  const selectFileLabel = `Toggle selection of ${file.data.fileName} in generated output`;

  const renderedActions = (
    <>
      <GeneratedFileDetailsFileActionButton
        icon={Copy}
        label={`Copy ${file.data.fileName}`}
        onClick={handleCopyFile}
      />
      <GeneratedFileDetailsFileActionButton
        icon={Download}
        label={`Download ${file.data.fileName}`}
        onClick={handleDownloadFile}
      />
    </>
  );

  return (
    <GeneratedFileDetailsFileStyles
      className={clsx({
        [generatedFileDetailsFileClasses.root]: true,
        [generatedFileDetailsFileClasses.singleFile]: isOnlyFile,
        [generatedFileDetailsFileClasses.selected]: isSelected,
      })}
      ref={ref}
    >
      <FileDetailsHeader
        actions={renderedActions}
        ariaLabel={selectFileLabel}
        icon={(
          <ProgrammingLanguageIcon
            language={resolveProgrammingLanguage(programmingLanguage)}
          />
        )}
        isSelected={isSelected}
        name={file.data.fileName}
        onSelect={onSelectFile ? handleSelectFile : undefined}
        tooltipTitle={file.data.fileName}
      />
      <GeneratedCodeEditor
        ariaLabel={`Generated code editor for ${file.data.fileName}`}
        glyphs={glyphs}
        height={`calc(${editorHeight}px + 0.8rem)`}
        selectedLine={selectedLine}
        syntaxReady={!isScrolling}
        value={file.data.text}
      />
    </GeneratedFileDetailsFileStyles>
  );
}
