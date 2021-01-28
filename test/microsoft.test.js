const { utils, config } = require('serverless-authentication')
const AWS = require('aws-sdk')
const nock = require('nock')
const url = require('url')
const refreshHandler = require('../authentication/lib/handlers/refreshHandler')
const callbackHandler = require('../authentication/lib/handlers/callbackHandler')
const signinHandler = require('../authentication/lib/handlers/signinHandler')

jest.mock('aws-sdk', () => {
  const mocks = {
    getMock: jest.fn().mockResolvedValue({}),
    putMock: jest.fn().mockResolvedValue({}),
    queryMock: jest.fn().mockImplementation((params) => {
      if (params.TableName === process.env.CACHE_DB_NAME) {
        return Promise.resolve({
          Items: [
            {
              token: process.env.STATE,
              userId: 'mock-user'
            }
          ]
        })
      }
      return Promise.reject(new Error('Invalid table'))
    }),
    updateMock: jest.fn().mockResolvedValue({}),
    adminCreateUserMock: jest.fn().mockResolvedValue({}),
    adminUpdateUserAttributesMock: jest.fn().mockResolvedValue({}),
    adminGetUserMock: jest.fn().mockResolvedValue({})
  }

  const DocumentClient = {
    get: (obj) => ({
      promise: () => mocks.getMock(obj)
    }),
    put: (obj) => ({
      promise: () => mocks.putMock(obj)
    }),
    query: (obj) => ({
      promise: () => mocks.queryMock(obj)
    }),
    update: (obj) => ({
      promise: () => mocks.updateMock(obj)
    })
  }

  const CognitoIdentityServiceProvider = {
    adminCreateUser: (obj) => ({
      promise: () => mocks.adminCreateUserMock(obj)
    }),
    adminUpdateUserAttributes: (obj) => ({
      promise: () => mocks.adminUpdateUserAttributesMock(obj)
    }),
    adminGetUser: (obj) => ({
      promise: () => mocks.adminGetUserMock(obj)
    })
  }

  return {
    mocks,
    DynamoDB: {
      DocumentClient: jest.fn().mockImplementation(() => DocumentClient)
    },
    CognitoIdentityServiceProvider: jest
      .fn()
      .mockImplementation(() => CognitoIdentityServiceProvider)
  }
})

afterEach(() => {
  AWS.mocks.getMock.mockClear()
  AWS.mocks.putMock.mockClear()
  AWS.mocks.queryMock.mockClear()
  AWS.mocks.updateMock.mockClear()
  AWS.mocks.adminCreateUserMock.mockClear()
  AWS.mocks.adminUpdateUserAttributesMock.mockClear()
  AWS.mocks.adminGetUserMock.mockClear()
})

afterAll(() => {
  jest.restoreAllMocks()
})

describe('Authentication Provider', () => {
  describe('Microsoft', () => {
    beforeAll(() => {
      process.env.STAGE = 'dev'
      process.env.CACHE_DB_NAME = 'dev-serverless-authentication-cache'
      process.env.REDIRECT_CLIENT_URI = 'http://127.0.0.1:3000/'
      process.env.TOKEN_SECRET = 'token-secret-123'
      process.env.PROVIDER_MICROSOFT_ID = 'ms-mock-id'
      process.env.PROVIDER_MICROSOFT_SECRET = 'ms-mock-secret'

      const payload = {
        client_id: 'ms-mock-id',
        redirect_uri:
          'https://api-id.execute-api.eu-west-1.amazonaws.com/dev/authentication/callback/microsoft',
        client_secret: 'ms-mock-secret',
        code: 'code',
        grant_type: 'authorization_code'
      }

      nock('https://login.live.com')
        .post(
          '/oauth20_token.srf',
          Object.keys(payload)
            .reduce(
              (result, key) =>
                result.concat(`${key}=${encodeURIComponent(payload[key])}`),
              []
            )
            .join('&')
        )
        .reply(200, {
          access_token: 'access-token-123'
        })

      nock('https://apis.live.net')
        .get('/v5.0/me')
        .query({ access_token: 'access-token-123' })
        .reply(200, {
          id: 'user-id-1',
          name: 'Eetu Tuomala',
          emails: {
            preferred: 'email@test.com'
          },
          picture: 'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460'
        })
    })

    let refreshToken = ''

    it('should return oauth signin url', async () => {
      const event = {
        pathParameters: {
          provider: 'microsoft'
        },
        requestContext: {
          stage: 'dev'
        },
        headers: {
          Host: 'api-id.execute-api.eu-west-1.amazonaws.com'
        }
      }

      const data = await signinHandler(event)
      const { query } = url.parse(data.headers.Location, true)
      const queryState = query.state
      process.env.STATE = queryState
      expect(data.headers.Location).toMatch(
        /https:\/\/login\.live\.com\/oauth20_authorize\.srf\?client_id=ms-mock-id&redirect_uri=https:\/\/api-id\.execute-api\.eu-west-1\.amazonaws\.com\/dev\/authentication\/callback\/microsoft&response_type=code&scope=wl\.basic wl\.emails&state=.{64}/
      )
    })

    it('should return local client url', async () => {
      const event = {
        pathParameters: {
          provider: 'microsoft'
        },
        queryStringParameters: {
          code: 'code',
          state: process.env.STATE
        },
        requestContext: {
          stage: 'dev'
        },
        headers: {
          Host: 'api-id.execute-api.eu-west-1.amazonaws.com'
        }
      }

      const providerConfig = config(event)
      const data = await callbackHandler(event)
      const { query } = url.parse(data.headers.Location, true)
      refreshToken = query.refresh_token
      expect(query.authorization_token).toMatch(
        /[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?/
      )
      expect(refreshToken).toMatch(/[A-Fa-f0-9]{64}/)
      const tokenData = utils.readToken(
        query.authorization_token,
        providerConfig.token_secret
      )
      expect(tokenData.id).toBe(
        '0bc293b1bf8b932f7a996605f13aae28011f45a933abb48d10b693b8edfc5b34'
      )
    })

    it('should get new authorization token', async () => {
      const event = {
        refresh_token: refreshToken
      }

      const data = await refreshHandler(event)
      expect(data.authorization_token).toMatch(
        /[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?/
      )
      expect(data.refresh_token).toMatch(/[A-Fa-f0-9]{64}/)
      expect(data.id).toBe('mock-user')
    })
  })
})
