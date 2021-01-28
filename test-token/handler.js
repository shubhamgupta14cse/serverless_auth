

const userClassName = process.env.USERS_CLASS_NAME || 'users' // shared with authentication service
const faunadb = require('faunadb')

const q = faunadb.query

const createResponse = (statusCode, payload) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  },
  body: JSON.stringify(payload)
})

module.exports.test = (event, context, cb) => {
  console.log('event', event)
  const authData = event.requestContext.authorizer
  if (authData.principalId) {
    if (authData.faunadb) {
      const client = new faunadb.Client({ secret: authData.faunadb })
      client.query(q.Get(q.Ref(`classes/${userClassName}/self`)))
        .then((result) => {
          console.log('result', result)
          cb(null, createResponse(200, result))
        })
        .catch((error) => {
          console.log('error', error)
          cb(null, createResponse(400, error))
        })
    } else {
      cb(null, createResponse(200, { username: authData.principalId }))
    }
  } else {
    cb(null, createResponse(400, { error: 'Invalid request' }))
  }
}
