const Joi = require("joi");

const schema = Joi.object({
  password: Joi.string().min(8).required(),

  confirmPassword: Joi.any()
    .equal(Joi.ref("password"))
    .required()
    .label("Confirm Password")
    .messages({ "any.only": "passwords do not match" }),
}).with("password", "confirmPassword");

module.exports = schema;
