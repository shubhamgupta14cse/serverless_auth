const policyMap = {
  ['policy-authorized']: 'Allow',
  ['policy-unauthorized']: 'Deny'
};

function evaluatePolicy(resource) {
  const arn_elements      = resource.split(':', 6);
  const resource_path = arn_elements[5].split('/', 4)[3];
  return policyMap[resource_path];
};

function generateIAMPolicy(user, effect, resource) {
  // const effect = evaluatePolicy(resource);
  const policy = {
    principalId: user,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
  return policy;
};

module.exports = generateIAMPolicy
