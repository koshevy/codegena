import type { GraphPayloadSourceLocation } from '@codegena/graph-core';
import type { DeclarationType } from '@codegena/oas3-core/ultimate-parser';

interface GraphSuggestionBase {
  id: string;
  nodeId?: string;
  sourceLocation?: GraphPayloadSourceLocation;
  title: string;
}

export interface GraphSuggestionCodeLine {
  content: string;
  lineNumber: number;
}

export interface GraphSuggestionCodeSnippet {
  activeColumnNumber: number;
  activeLineNumber: number;
  lines: GraphSuggestionCodeLine[];
}

export interface GraphSuggestionFile extends GraphSuggestionBase {
  kind: 'file';
  snippet?: GraphSuggestionCodeSnippet;
}

export interface GraphSuggestionDirectory extends GraphSuggestionBase {
  directoryCount: number;
  fileCount: number;
  kind: 'directory';
}

export interface GraphSuggestionDeclaration extends GraphSuggestionBase {
  declarationType: DeclarationType;
  fileName: string;
  kind: 'declaration';
  snippet?: GraphSuggestionCodeSnippet;
}

export interface GraphSuggestionWarning extends GraphSuggestionBase {
  kind: 'warning';
}

export interface GraphSuggestionSpecification extends GraphSuggestionBase {
  kind: 'spec-snippet';
  snippet?: GraphSuggestionCodeSnippet;
}

export type GraphSuggestion = (
  GraphSuggestionDirectory
  | GraphSuggestionDeclaration
  | GraphSuggestionFile
  | GraphSuggestionWarning
  | GraphSuggestionSpecification
);
