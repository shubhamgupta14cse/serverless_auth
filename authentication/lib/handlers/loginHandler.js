// const yup = require("yup");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Responses = require('../utils/response')

// const loginSchema = yup.object().shape({
//   email: yup.string().email().required(),
//   password: yup.string().required(),
// });

const handler = async (event) => {
  try {
    const creds = JSON.parse(event.body);
    // const hash = await bcrypt.hash('1234567', 10)
    const validPass = creds.password == "1234567"
    if (!validPass) {
      return Responses._401(
        { error: "invalid credentials" },
        event.headers.origin
      );
    }

    const token = jwt.sign(
      { user: { email: creds.eamil }, type: "student" },
      'abcd'
    );
    return Responses._200(
      { token: token },
      event.headers.origin
    );
  } catch (err) {
    console.log("error", err);
    return Responses._400({ error: err.message }, event.headers.origin);
  }
};

module.exports = handler;
