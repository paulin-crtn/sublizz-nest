export const accessTokenResponse = {
  content: {
    'application/json': {
      example: {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiZmlyc3RuYW1lQG1haWwuY29tIiwiaWF0IjoxNjY0MTk2NjY0LCJleHAiOjE2NjQxOTc1NjR9.OG99jw03i9QmUofpSJ5579Ob-_iMapE3e9z2k1A9Y4I',
      },
      schema: {
        type: 'object',
        properties: {
          access_token: {
            type: 'string',
          },
        },
      },
    },
  },
};

export const userEmailResponse = {
  content: {
    'application/json': {
      example: {
        userEmail: 'john@gmail.com',
      },
      schema: {
        type: 'object',
        properties: {
          userEmail: {
            type: 'string',
          },
        },
      },
    },
  },
};
