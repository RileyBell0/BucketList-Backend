const Joi = require("joi");

const schema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required(),

  password: Joi.string().min(8).required(),
});

module.exports = schema;
