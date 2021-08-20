export type Either<Left, Right> =
  | { value: Left; error: undefined }
  | { error: Right; value: undefined };

export interface ToolDescription {
  name: string;
  description: string;
}

export interface ToolsData {
  data: { [toolKey: string]: ToolDescription };
}
