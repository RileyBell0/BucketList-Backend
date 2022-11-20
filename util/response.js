// For sending responses of a given type, sets up required fields

const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_BAD_REQUEST = 400;
const STATUS_UNAUTHORISED = 401;
const STATUS_FORBIDDEN = 403;
const STATUS_SERVER_ERROR = 500;

function send(res, status, jsonResponse) {
  res.status(status);
  res.json(jsonResponse);
}

const responseExports = {
  STATUS_OK: STATUS_OK,
  STATUS_CREATED: STATUS_CREATED,
  STATUS_BAD_REQUEST: STATUS_BAD_REQUEST,
  STATUS_UNAUTHORISED: STATUS_UNAUTHORISED,
  STATUS_FORBIDDEN: STATUS_FORBIDDEN,
  STATUS_SERVER_ERROR: STATUS_SERVER_ERROR,
  send: send,
};

module.exports = responseExports;
