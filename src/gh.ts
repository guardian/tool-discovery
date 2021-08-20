import https from "https";
import { TextEncoder } from "util";
import { ghToken } from "./constants";
import { GraphQLResponse, ToolData, ToolsData } from "./types";

const getRepoQuery = (cursor: string | undefined) => `{
  search(query: "org:guardian", type: REPOSITORY, first: 100${
    cursor ? `, after: "${cursor}"` : ""
  }) {
    codeCount
    pageInfo {
      endCursor
      hasNextPage
    }
    edges {
      node {
        ... on Repository {
          nameWithOwner
          object(expression: "HEAD:.gutools.json") {
            ... on Blob {
              text
            }
          }
        }
      }
    }
  }
}`;

export const fetchToolsDataFromGithub = async (): Promise<ToolsData> => {
  let hasNextPage = true;
  let cursor = undefined;
  const toolsData: ToolsData = {
    data: {},
  };

  while (hasNextPage) {
    const result: GraphQLResponse = await fetchGithubData(cursor);
    const {
      data: {
        search: { pageInfo, edges },
      },
    } = result;

    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;

    edges
      .filter((edge) => edge.node.object)
      .map(queryNodeToToolData)
      .forEach(({ name, toolData }) => {
        toolsData.data[name] = toolData;
      });
  }

  return toolsData;
};

const queryNodeToToolData = (
  queryNode: GraphQLResponse["data"]["search"]["edges"][number]
): { name: string; toolData: ToolData } => {
  const toolData: ToolData = JSON.parse(queryNode.node.object!);
  return {
    name: getNormalisedToolName(queryNode.node.nameWithOwner, toolData.name),
    toolData,
  };
};

const getNormalisedToolName = (repoName: string, toolName: string) =>
  `${repoName}/${toolName.replace(" ", "_")}`;

const fetchGithubData = (
  cursor: string | undefined
): Promise<GraphQLResponse> => {
  const body = JSON.stringify({
    query: getRepoQuery(cursor),
  });
  const requestData = new TextEncoder().encode(body);

  const options = {
    hostname: "api.github.com",
    port: 443,
    path: "/graphql",
    method: "POST",
    headers: {
      "Content-Type": "application/graphql",
      "Content-Length": requestData.length,
      Authorization: `bearer ${ghToken}`,
      "User-Agent": "node.js",
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      if (res.statusCode && res.statusCode > 299) {
        reject(new Error(res.statusMessage));
      }

      res.on("data", (chunk) => {
        return (data += chunk);
      });

      res.on("end", () => {
        resolve(JSON.parse(data.toString()));
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(requestData);
    req.end();
  });
};
