import { APIGatewayProxyResult } from "aws-lambda";
import { toolDiscoveryBucketName } from "./constants";

import { createOkResponse } from "./response";
import { putToolData } from "./util";
import { fetchToolsDataFromGithub } from "./gh";

export const handler = async (): Promise<APIGatewayProxyResult> => {
  const toolData = await fetchToolsDataFromGithub();

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
