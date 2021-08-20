import { s3 } from "./aws";
import { toolDiscoveryBucketName, toolDiscoveryKeyName } from "./constants";
import { ToolsData } from "./types";

export const putToolData = async (toolData: ToolsData): Promise<void> => {
  console.log(
    `Attempting to write from file at s3://${toolDiscoveryBucketName}/${toolDiscoveryKeyName}`
  );

  const params = {
    Bucket: toolDiscoveryBucketName,
    Key: toolDiscoveryKeyName,
    Body: JSON.stringify(toolData),
  };
  await s3.putObject(params).promise();

  console.log("Write successful");
};

export const getToolData = async (): Promise<void> => {
  const params = {
    Bucket: toolDiscoveryBucketName,
    Key: toolDiscoveryKeyName,
  };
  await s3.getObject(params).promise();
};
