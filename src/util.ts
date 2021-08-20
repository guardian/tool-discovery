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
    return left(JSON.parse(result?.toString() || "") as ToolsData);
  } catch (e) {
    return right(e);
  }
};

/**
 * Constructors for the Either type.
 */
export const left = <Value, Error>(error: Error): Either<Value, Error> => ({
  value: undefined,
  error,
});
export const right = <Value, Error>(value: Value): Either<Value, Error> => ({
  value,
  error: undefined,
});
