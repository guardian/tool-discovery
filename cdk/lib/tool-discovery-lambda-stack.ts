import {
  Stack,
  Construct,
  StackProps,
  Duration,
  Tag,
  CfnParameter,
  RemovalPolicy,
} from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as s3 from "@aws-cdk/aws-s3";
import * as iam from "@aws-cdk/aws-iam";
import { StringParameter } from "@aws-cdk/aws-ssm";
import { BucketEncryption, BlockPublicAccess, Bucket } from "@aws-cdk/aws-s3";

export class ToolDiscoveryLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /**
     * Parameters
     */

    const stackParameter = new CfnParameter(this, "Stack", {
      type: "String",
      description: "Stack",
    });

    const stageParameter = new CfnParameter(this, "Stage", {
      type: "String",
      description: "Stage",
    });

    const ghTokenParameter = StringParameter.fromStringParameterAttributes(
      this,
      "GithubToken",
      {
        version: 1,
        parameterName: `/${stageParameter.valueAsString}/${stackParameter.valueAsString}/tool-discovery/github-token`,
        simpleName: true,
      }
    );

    /**
     * S3 bucket – where our tools data is persisted
     */

    const toolDiscoveryDataBucket = new Bucket(
      this,
      "tool-discovery-data-bucket",
      {
        versioned: false,
        bucketName: "tool-discovery-data",
        encryption: BucketEncryption.KMS_MANAGED,
        publicReadAccess: false,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );

    /**
     * Lambda
     */

    const deployBucket = s3.Bucket.fromBucketName(
      this,
      "developer-playground-dist",
      "developer-playground-dist"
    );

    /**
     * API Lambda
     */

    const createToolDiscoveryLambda = () => {
      const fn = new lambda.Function(this, `ToolsDiscoveryLambda`, {
        runtime: lambda.Runtime.NODEJS_14_X,
        memorySize: 128,
        timeout: Duration.seconds(120),
        handler: "index.handler",
        environment: {
          STAGE: stageParameter.valueAsString,
          STACK: stackParameter.valueAsString,
          APP: "tool-discovery",
          TOOLS_DISCOVERY_BUCKET_NAME: toolDiscoveryDataBucket.bucketName,
          GITHUB_TOKEN: ghTokenParameter.stringValue,
        },
        functionName: `tool-discovery-lambda-${stageParameter.valueAsString}`,
        code: lambda.Code.bucket(
          deployBucket,
          `${stackParameter.valueAsString}/${stageParameter.valueAsString}/tool-discovery-lambda/tool-discovery-lambda.zip`
        ),
      });
      Tag.add(fn, "App", "tool-discovery");
      Tag.add(fn, "Stage", stageParameter.valueAsString);
      Tag.add(fn, "Stack", stackParameter.valueAsString);
      return fn;
    };

    const toolDiscoveryLambda = createToolDiscoveryLambda();

    const toolDiscoveryBackendPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["s3:PutObject"],
      resources: [
        toolDiscoveryDataBucket.bucketArn,
        `${toolDiscoveryDataBucket.bucketArn}/*`,
      ],
    });

    toolDiscoveryLambda.addToRolePolicy(toolDiscoveryBackendPolicyStatement);
  }
}
