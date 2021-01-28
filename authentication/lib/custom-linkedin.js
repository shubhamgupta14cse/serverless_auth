const { Provider, Profile } = require('serverless-authentication')

const signinHandler = (config, options) => {
  const customLinkedIn = new Provider(config)
  const signinOptions = options || {}
  signinOptions.signin_uri = 'https://www.linkedin.com/oauth/v2/authorization'
  signinOptions.scope = 'r_liteprofile r_emailaddress'
  signinOptions.response_type = 'code'
  return customLinkedIn.signin(signinOptions)
}

const callbackHandler = async (event, config) => {
  const customLinkedIn = new Provider(config)
  const profileMap = (response) =>
    new Profile({
      id: response.id,
      name: response.firstName + response.lastName,
      email: response['handle~'] ? response['handle~'].emailAddress : null,
      picture: response.profilePicture ? response.profilePicture.displayImage : null,
      provider: 'linkedin',
      // at: response.access_token
    })

  const options = {
    authorization_uri: 'https://www.linkedin.com/oauth/v2/accessToken',
    profile_uri: 'https://api.linkedin.com/v2/me',
    profileMap
  }

  return customLinkedIn.callback(event, options, {
    authorization: { grant_type: 'authorization_code' }
  })
}

module.exports = {
  signinHandler,
  callbackHandler
}
