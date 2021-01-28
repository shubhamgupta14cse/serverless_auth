// Config
const { config, utils } = require('serverless-authentication')
const generateIAMPolicy = require('../utils/policyUtils')
const jwt = require("jsonwebtoken");

const decodeToken = (token) => {
  const decoded = jwt.verify(token, 'abcd');
  if (true) {
    let user = decoded.user;
    user.type = decoded.type;
    return user;
  } else {
    return null;
  }
};

const policyContext = (data) => {
  const context = {}
  Object.keys(data).forEach((k) => {
    if (k !== 'id' && [ 'boolean', 'number', 'string' ].indexOf(typeof data[k]) !== -1) {
      context[k] = data[k]
    }
  })
  return context
}

// Authorize
const authorize = async (event) => {
  const stage = event.methodArn.split('/')[1] || 'dev' // @todo better implementation
  let error = null
  let policy
  const { authorizationToken } = event
  if (!authorizationToken) {
    return Promise.resolve(generateIAMPolicy("undefined", "Deny", {}));
  }
  const tokenParts = authorizationToken.split(" ");
  const token = tokenParts[1];
  if (!(tokenParts[0].toLowerCase() === "bearer" && token)) {
    return Promise.resolve(generateIAMPolicy("undefined", "Deny", {}));
  }
  const user = decodeToken(token);
  if (user != null) {
    const authorizerContext = { user: JSON.stringify(user) };
    return Promise.resolve(generateIAMPolicy('12345', "Allow", authorizerContext));
  } else {
    return Promise.resolve(generateIAMPolicy("undefined", "Deny", {}));
  }
  // // policy = generateIAMPolicy('1234567', event.methodArn);
  // // console.warn("this is the policy ----------------------->",JSON.stringify(policy))
  // return Promise.resolve(policy);
}


module.exports = authorize
