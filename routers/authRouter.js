const express = require("express");
const auth = require("../auth/auth");
const router = express.Router();
const authApi = require("../api/authApi");
const userApi = require("../api/userApi");

router.post("/checkAuth", authApi.checkAuth);

router.post(
  "/register",
  auth.checkUnauthenticated,
  auth.registerSchemaCheck,
  userApi.addUser
);

router.post(
  "/login",
  auth.checkUnauthenticated,
  auth.loginSchemaCheck,
  authApi.login
);

router.post("/signOut", authApi.signOut);

router.post("/resetPassword", authApi.resetPassword);

module.exports = router;
