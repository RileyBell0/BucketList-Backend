const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const passport = require("passport");
const userApi = require("../api/userApi");

const incorrectPassword =
  'Wrong password. Try again or click "Forgot password"';

function initialise(passport, getUserByEmail, getUserByID) {
  // Authenticate a user by their email and password
  const authUser = async (email, password, done) => {
    // Ensure a user with the given email exists
    console.log("PASSPORT - Authenticating user");
    try {
      email = email.toLowerCase();
      console.log("PASSPORT - " + email);
      const user = await getUserByEmail(email);
      console.log("PASSPORT - Got user by email, result was " + user);
      if (user === null) {
        throw "There is no user with that email";
      }

      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: incorrectPassword });
      }
    } catch (e) {
      return done(e);
    }
  };

  // Setup Username / password strategy
  passport.use(new LocalStrategy({ usernameField: "email" }, authUser));

  // Serialse based on user ID => ID must be unique
  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });
  passport.deserializeUser(async (id, done) => {
    let user = await getUserByID(id);
    return done(null, user);
  });
}

// Set up passport middleware
initialise(passport, userApi.getUserByEmail, userApi.getUserByID);

module.exports = passport;
