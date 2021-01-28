const signinHandler = require('./lib/handlers/signinHandler')
const callbackHandler = require('./lib/handlers/callbackHandler')
const refreshHandler = require('./lib/handlers/refreshHandler')
const authorizeHandler = require('./lib/handlers/authorizeHandler')
const { setupSchemaHandler } = require('./lib/storage/fauna/faunaUser')
const loginHandler = require('./lib/handlers/loginHandler')

module.exports.signin = async (event) => signinHandler(event)

module.exports.callback = async (event) => callbackHandler(event)

module.exports.refresh = async (event) => refreshHandler(event)

module.exports.authorize = async (event) => authorizeHandler(event)

module.exports.schema = (event, context, cb) => setupSchemaHandler(event, cb)

module.exports.login = (event, context, cb) => loginHandler(event, cb)

module.exports.helloWorld = function (event, context) {
	context.succeed('hello world');
};

module.exports.mock = function (event, context) {
	context.succeed('mock response');
};
