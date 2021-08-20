import { APIGatewayProxyResult } from "aws-lambda";
import { toolDiscoveryBucketName } from "./constants";

import { createOkResponse } from "./response";
import { writeToolDataToS3 } from "./util";

export const handler = async (): Promise<APIGatewayProxyResult> => {
  const toolData = {
    data: {
      exampleTool: {
        name: "Example tool",
        description: "Example description",
      },
    },
  };

  await writeToolDataToS3(toolData);

  return {
    statusCode: 201,
    body: JSON.stringify(
      createOkResponse(
        `Tool descriptions have been persisted to ${toolDiscoveryBucketName}`
      )
    ),
  };
};
