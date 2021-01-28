const dynamoose = require("dynamoose");

let createTable = false;
let waitForActive = false;
if (process.env.IS_OFFLINE) {
  createTable = true;
  waitForActive = true;
  dynamoose.aws.ddb.local();
}

const userSchema = new dynamoose.Schema(
  {
    _id: {
      type: String,
      hashKey: true,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
  },
  {
    saveUnknown: true,
    timestamps: true,
  }
);

const User = dynamoose.model(process.env.USERS_DB_NAME, userSchema, {
  create: createTable,
  throughput: "ON_DEMAND",
  waitForActive: waitForActive,
});

module.exports = User;
