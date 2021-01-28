const AWS = require('aws-sdk')
const signinHandler = require('../authentication/lib/handlers/signinHandler')

jest.mock('aws-sdk', () => {
  const mocks = {
    putMock: jest.fn().mockResolvedValue({})
  }
  const DocumentClient = {
    put: (obj) => ({
      promise: () => mocks.putMock(obj)
    })
  }
  return {
    mocks,
    DynamoDB: {
      DocumentClient: jest.fn().mockImplementation(() => DocumentClient)
    }
  }
})

afterEach(() => {
  AWS.mocks.putMock.mockClear()
})

afterAll(() => {
  jest.restoreAllMocks()
})

describe('Authentication', () => {
  beforeAll(() => {
    process.env.STAGE = 'dev'
    process.env.CACHE_DB_NAME = 'dev-serverless-authentication-cache'
    process.env.REDIRECT_CLIENT_URI = 'http://127.0.0.1:3000/'
    process.env.TOKEN_SECRET = 'token-secret-123'
  })

  describe('Signin', () => {
    it('should fail to return token for invalid provider', async () => {
      const event = {
        pathParameters: {
          provider: 'invalid'
        },
        requestContext: {
          stage: 'dev'
        },
        headers: {
          Host: 'api-id.execute-api.eu-west-1.amazonaws.com'
        }
      }

      const data = await signinHandler(event)
      expect(data.statusCode).toBe(302)
      expect(data.headers.Location).toBe(
        'http://127.0.0.1:3000/?error=Invalid provider: invalid'
      )
    })
  })
})
