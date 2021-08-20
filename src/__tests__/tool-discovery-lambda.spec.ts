import nock from "nock";

import { ghResponse1, ghResponse2 } from "./fixtures";
import { handler } from "../index";
import { s3 } from "../aws";
import { toolDiscoveryBucketName } from "../constants";
import { getToolData } from "../util";
import { createOkResponse } from "../response";

jest.mock("uuid", () => ({
  v4: () => "mock-uuid",
}));

describe("s3 event handler", () => {
  const _Date = Date;
  const constantDate = new Date("2020-09-03T17:34:37.839Z");

  beforeAll(async () => {
    try {
      await s3.listObjects({ Bucket: toolDiscoveryBucketName }).promise();
    } catch (e) {
      throw new Error(
        `Error with localstack – the tests require localstack to be running with an S3 bucket named '${toolDiscoveryBucketName}' available. Is localstack running? The error was: ${e.message}`
      );
    }

    // @ts-ignore
    global.Date = class extends Date {
      constructor() {
        super();
        return constantDate;
      }
    };
  });

  afterAll(() => {
    global.Date = _Date;
  });

  it("should read s3 files from the given event, and reject them if they're malformed", async () => {
    nock("https://api.github.com").post("/graphql").reply(200, ghResponse1);
    nock("https://api.github.com").post("/graphql").reply(200, ghResponse2);

    const lambdaResponse = await handler();

    const expectedResponse = JSON.stringify(
      createOkResponse(
        `Tool descriptions have been persisted to ${toolDiscoveryBucketName}`
      )
    );
    expect(lambdaResponse.statusCode).toBe(201);
    expect(lambdaResponse.body).toEqual(expectedResponse);

    const writtenToolData = await getToolData();
    expect(writtenToolData.value).toEqual({
      data: {
        "guardian/project1/Project_1": {
          description: "An example project 1",
          name: "Project 1",
        },
        "guardian/project3/Project_2": {
          description: "An example project 2",
          name: "Project 2",
        },
      },
    });
  });
});
