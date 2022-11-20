const Joi = require("joi");

const schema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required(),

  password: Joi.string().min(8).required(),

  password_confirmation: Joi.any()
    .equal(Joi.ref("password"))
    .required()
    .label("Confirm Password")
    .messages({ "any.only": "passwords do not match" }),
}).with("password", "password_confirmation");

module.exports = schema;
