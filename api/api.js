const express = require("express");
const router = express.Router();
const apiRouter = require("../routers/apiRouter");
const authRouter = require("../routers/authRouter");
const response = require("../util/response");

router.use(apiRouter);
router.use(authRouter);

router.get("*", (req, res) => {
  response.send(res, response.STATUS_OK, { message: "Pink Hippos Backend!!" });
});

module.exports = router;
