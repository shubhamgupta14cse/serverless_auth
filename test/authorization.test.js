const { utils, config } = require('serverless-authentication')

const authorize = require('../authentication/lib/handlers/authorizeHandler')

describe('Authorization', () => {
  beforeAll(() => {
    process.env.STAGE = 'dev'
    process.env.CACHE_DB_NAME = 'dev-serverless-authentication-cache'
    process.env.REDIRECT_CLIENT_URI = 'http://127.0.0.1:3000/'
    process.env.TOKEN_SECRET = 'token-secret-123'
  })

  describe('Authorize', () => {
    it('should return policy', async () => {
      const payload = { id: 'username-123' }
      const providerConfig = config({ provider: '', stage: 'dev' })
      const authorizationToken = utils.createToken(
        payload,
        providerConfig.token_secret
      )
      const event = {
        type: 'TOKEN',
        authorizationToken,
        methodArn:
          'arn:aws:execute-api:<regionId>:<accountId>:<apiId>/dev/<method>/<resourcePath>'
      }

      const data = await authorize(event)
      expect(data.principalId).toBe(payload.id)
    })
  })
})
