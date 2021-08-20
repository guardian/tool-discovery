export const ghResponse1 = JSON.stringify({
  data: {
    search: {
      codeCount: 0,
      pageInfo: { endCursor: "Y3Vyc29yOjEw", hasNextPage: true },
      edges: [
        {
          node: {
            nameWithOwner: "guardian/project1",
            object: JSON.stringify({
              name: "Project 1",
              description: "An example project 1",
            }),
          },
        },
        { node: { nameWithOwner: "guardian/project2", object: null } },
      ],
    },
  },
});

export const ghResponse2 = JSON.stringify({
  data: {
    search: {
      codeCount: 0,
      pageInfo: { endCursor: "", hasNextPage: false },
      edges: [
        {
          node: {
            nameWithOwner: "guardian/project3",
            object: JSON.stringify({
              name: "Project 2",
              description: "An example project 2",
            }),
          },
        },
      ],
    },
  },
});
