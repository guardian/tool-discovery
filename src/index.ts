import { APIGatewayProxyResult } from "aws-lambda";
import { toolDiscoveryBucketName } from "./constants";

import { createOkResponse } from "./response";
import { putToolData } from "./util";

export const handler = async (): Promise<APIGatewayProxyResult> => {
  const toolData = {
    data: {
      exampleTool: {
        name: "Example tool",
        description: "Example description",
      },
    },
  };

  await putToolData(toolData);

  return {
    statusCode: 201,
    body: JSON.stringify(
      createOkResponse(
        `Tool descriptions have been persisted to ${toolDiscoveryBucketName}`
      )
    ),
  };
};
