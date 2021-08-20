export type Either<Left, Right> =
  | { value: Right; error: undefined }
  | { error: Left; value: undefined };

export interface ToolData {
  name: string;
  description: string;
}

export interface ToolsData {
  data: { [toolKey: string]: ToolData };
}

export interface GraphQLResponse {
  data: {
    search: {
      codeCount: number;
      pageInfo: { endCursor: string; hasNextPage: boolean };
      edges: Array<{
        node: {
          nameWithOwner: string;
          object: null | string;
        };
      }>;
    };
  };
}
