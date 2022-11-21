const response = require("../util/response");
const passport = require("../auth/passportConfig");
const nodemailer = require("nodemailer");
const { getUserByEmail, changePassword } = require("./userApi");
const generator = require("generate-password");

function checkAuth(req, res) {
  response.send(res, response.STATUS_OK, {
    isAuthenticated: req.isAuthenticated(),
  });
}

function login(req, res, next) {
  console.log("Trying to log user in");
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      // If another error occured, send to user
      return response.send(res, response.STATUS_UNAUTHORISED, {
        message: err,
      });
    }
    if (!user) {
      // If credentials were invalid, return error message
      return response.send(res, response.STATUS_UNAUTHORISED, info);
    }
    req.logIn(user, (err) => {
      if (err) {
        return response.send(res, response.STATUS_SERVER_ERROR);
      }
      console.log("Successfully signed in", user, "on session", req.sessionID);
      return response.send(res, response.STATUS_OK);
    });
  })(req, res, next);
}

function signOut(req, res) {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    response.send(res, response.STATUS_OK);
  });
}

async function resetPassword(req, res) {
  const email = req.body.email;
  console.log("Attempting to reset password for", email);

  const newPass = generator.generate({
    numbers: true,
    excludeSimilarCharacters: true,
  });

  const user = await getUserByEmail(email);
  if (!user) {
    console.log("User does not exist.");
    return response.send(res, response.STATUS_BAD_REQUEST, {
      message: "User with that email does not exist.",
    });
  }

  await changePassword(user, newPass);

  let transporter = await nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.verify(function (error) {
    if (error) {
      console.log(error);
      return response.send(res, response.STATUS_SERVER_ERROR);
    } else {
      console.log("SMTP Transport created successfully.");
    }
  });

  await transporter.sendMail({
    to: email,
    subject: "Password reset for BucketList",
    text:
      "Your password has been reset. Please sign in with your new password:\n" +
      newPass +
      "\nYou should change your password on the settings page once you have signed in.",
  });

  console.log("Sent email.");

  return response.send(res, response.STATUS_OK);
}

const authApi = {
  checkAuth: checkAuth,
  login: login,
  signOut: signOut,
  resetPassword: resetPassword,
};

module.exports = authApi;
