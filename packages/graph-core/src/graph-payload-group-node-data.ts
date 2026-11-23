export interface GraphPayloadGroupNodeData extends Record<string, unknown> {
  fileName: string;
  hideUnconnectedHandles?: boolean;
  kind: 'group';
  label: string;
  text: string;
  programmingLanguage: string;
}
