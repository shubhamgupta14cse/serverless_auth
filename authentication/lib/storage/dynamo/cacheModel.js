const dynamoose = require("dynamoose");

let createTable = false;
let waitForActive = false;
if (process.env.IS_OFFLINE) {
  createTable = true;
  waitForActive = true;
  dynamoose.aws.ddb.local();
}

const cacheSchema = new dynamoose.Schema(
  {
    token: {
      type: String,
      hashKey: true,
    },
    type: {
      type: String,
    },
    expired: {
      type: Boolean,
    },
  },
  {
    saveUnknown: true,
    timestamps: true,
  }
);

const Cache = dynamoose.model(process.env.CACHE_DB_NAME, cacheSchema, {
  create: createTable,
  throughput: "ON_DEMAND",
  waitForActive: waitForActive,
});

module.exports = Cache;
