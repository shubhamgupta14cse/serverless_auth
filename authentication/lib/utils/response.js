const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:8081",
  "https://abiliyo.netlify.app",
  "https://develop--abiliyo.netlify.app",
];
const Responses = {
  _DefineResponse(statusCode = 500, data = {}, origin) {
    let headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    };
    if (ALLOWED_ORIGINS.includes(origin)) {
      headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Credentials": true,
      };
    }
    return {
      headers: headers,
      statusCode,
      body: JSON.stringify(data),
    };
  },

  _200(data = {}, origin = "http://localhost:3000") {
    return this._DefineResponse(200, data, origin);
  },
  _400(data = {}, origin = "http://localhost:3000") {
    return this._DefineResponse(400, data, origin);
  },
  _401(data = {}, origin = "http://localhost:3000") {
    return this._DefineResponse(401, data, origin);
  },
  _404(data = {}, origin = "http://localhost:3000") {
    return this._DefineResponse(404, data, origin);
  },
  _500(data = {}, origin = "http://localhost:3000") {
    return this._DefineResponse(500, data, origin);
  },
};

module.exports = Responses;
