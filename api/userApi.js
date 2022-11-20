// This file contains functions used by router for handling requests associated with users
const { User } = require("../schema/user");
const bcrypt = require("bcrypt");
const registerSchema = require("../schema/register");
const response = require("../util/response");

/*
 * Returns the resultant database entry of the user with the given email
 * returns NULL on failure
 */
async function getUserByEmail(email) {
  try {
    const user = await User.findOne({
      email: email,
    });

    return user;
  } catch (e) {
    return null;
  }
}

/*
 * Returns the resultant database entry of the user with the given ID
 * returns NULL on failure
 */
async function getUserByID(id) {
  try {
    const user = await User.findById(id).exec();
    return user;
  } catch (e) {
    return null;
  }
}

/*
 * Returns true if no account uses this email, false otherwise
 */
async function isEmailAvailable(email) {
  const user = await getUserByEmail(email);
  if (user == null) {
    return true;
  }
  return false;
}

async function changePassword(user, newPassword) {
  const hashedPassword = await hashPassword(newPassword);

  user.password = hashedPassword;
  user.save();
}

/*
 * Given a string "password", creates and returns a randomly salted hash
 */
async function hashPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

async function addUser(req, res) {
  // Ensure input matches register schema requirements
  const { error, value } = registerSchema.validate(req.body);
  if (error !== undefined) {
    return response.send(res, response.STATUS_BAD_REQUEST, {
      error: error.message,
    });
  }

  // Attempt to create a user with the given details
  try {
    // Ensure the user doesn't already exist
    const email = value.email.toLowerCase();
    if (!(await isEmailAvailable(email))) {
      return response.send(res, response.STATUS_BAD_REQUEST, {
        error: "Email is already in use",
      });
    }

    // Hash password before storing
    const hashedPassword = await hashPassword(value.password);

    // Save a new user with the given details to the database
    const user = new User({ email: email, password: hashedPassword });
    await user.save();

    return response.send(res, response.STATUS_CREATED, {
      message: "Account Created Successfully!",
    });
  } catch (err) {
    return response.send(res, response.STATUS_BAD_REQUEST, {
      error: err.toString(),
    });
  }
}

const userAPI = {
  getUserByEmail: getUserByEmail,
  getUserByID: getUserByID,
  addUser: addUser,
  changePassword: changePassword,
};

module.exports = userAPI;
