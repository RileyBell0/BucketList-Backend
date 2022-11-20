const loginSchema = require("../schema/login");
const registerSchema = require("../schema/register");
const response = require("../util/response");

// Ensure required components of a login request are present and well-formed
function loginSchemaCheck(req, res, next) {
  const { error } = loginSchema.validate(req.body);

  // Send error messages
  if (error !== undefined) {
    if (error.details[0].type === "string.email") {
      return response.send(res, response.STATUS_BAD_REQUEST, {
        message:
          '"' + error.details[0].context.value + '" is not a vaild email',
      });
    }
    return response.send(res, response.STATUS_BAD_REQUEST, {
      message: error.message,
    });
  }

  next();
}

function registerSchemaCheck(req, res, next) {
  const { error } = registerSchema.validate(req.body);
  if (error !== undefined) {
    if (error.details[0].type === "string.email") {
      return response.send(res, response.STATUS_BAD_REQUEST, {
        error: '"' + error.details[0].context.value + '" is not a vaild email',
      });
    }
    return response.send(res, response.STATUS_BAD_REQUEST, {
      error: error.message,
    });
  }
  next();
}

function checkUnauthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return response.send(res, response.STATUS_BAD_REQUEST, {
      message: "already authenticated",
    });
  } else {
    next();
  }
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    return (
      response.send(res, response.STATUS_UNAUTHORISED),
      {
        message: "authentication required to access this route",
      }
    );
  }
}

const authExports = {
  loginSchemaCheck: loginSchemaCheck,
  registerSchemaCheck: registerSchemaCheck,
  checkAuthenticated: checkAuthenticated,
  checkUnauthenticated: checkUnauthenticated,
};

module.exports = authExports;
