import { s3 } from "./aws";
import { toolDiscoveryBucketName, toolDiscoveryKeyName } from "./constants";
import { Either, ToolsData } from "./types";

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

export const getToolData = async (): Promise<Either<Error, ToolsData>> => {
  const params = {
    Bucket: toolDiscoveryBucketName,
    Key: toolDiscoveryKeyName,
  };

  const result = (await s3.getObject(params).promise()).Body;

  try {
    return right(JSON.parse(result?.toString() || "") as ToolsData);
  } catch (e) {
    return left(e);
  }
};

/**
 * Constructors for the Either type.
 */
export const left = <Value, Error>(error: Error): Either<Error, Value> => ({
  value: undefined,
  error,
});
export const right = <Value, Error>(value: Value): Either<Error, Value> => ({
  value,
  error: undefined,
});
