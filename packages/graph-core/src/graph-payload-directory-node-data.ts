export interface GraphPayloadDirectoryNodeData extends Record<string, unknown> {
  kind: 'directory';
  label: string;
  relativeDirectoryPath: string;
}
