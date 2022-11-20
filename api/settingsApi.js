const response = require("../util/response");
const userAPI = require("./userApi");
const changePasswordSchema = require("../schema/changePassword");

// Essentially, wraps a getEmail and getTheme request into a single call to
// the backend
function getSettings(req, res) {
  if (!req.user) return res.status(404).send("Couldn't find user");

  res.status(response.STATUS_OK);
  res.json({
    theme: req.user.theme,
    email: req.user.email,
    darkMode: req.user.darkMode,
    useSystemTheme: req.user.useSystemTheme,
  });
}

function changePassword(req, res) {
  if (!req.user) return res.status(404).send("Couldn't find user");
  console.log("Attempting to change password...");
  userAPI
    .changePassword(req.user, req.body.password)
    .then(() => {
      console.log("Password changed successfully");
      res.status(response.STATUS_OK);
      res.json({ message: "Password Changed Successfully" });
    })
    .catch(() => {
      console.log("Password change failed");
      res.status(response.STATUS_SERVER_ERROR);
      res.send({ error: "Internal Server Error - try again later" });
    });
}

function changePasswordSchemaCheck(req, res, next) {
  const { error } = changePasswordSchema.validate(req.body);
  if (error !== undefined) {
    return response.send(res, response.STATUS_BAD_REQUEST, {
      message: error.message,
    });
  }
  next();
}

const settingsAPI = {
  getSettings: getSettings,
  changePassword: changePassword,
  changePasswordSchemaCheck: changePasswordSchemaCheck,
};

module.exports = settingsAPI;
