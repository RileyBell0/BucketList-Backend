const Joi = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const tripJoiSchema = Joi.object({
  name: Joi.string().required(),
  desc: Joi.string().allow(""),
});

const tripJoiUpdateSchema = Joi.object({
  name: Joi.string(),
  desc: Joi.string().allow(""),
});

const tripJoiDeleteSchema = Joi.object({
  name: Joi.string().required(),
  deleteDestinations: Joi.boolean().required(),
});

const tripSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  desc: {
    type: String,
  },
});

const Trip = mongoose.model("Trip", tripSchema);

const tripSchemaExports = {
  tripJoiUpdateSchema: tripJoiUpdateSchema,
  tripJoiSchema: tripJoiSchema,
  tripJoiDeleteSchema: tripJoiDeleteSchema,
  Trip: Trip,
};
module.exports = tripSchemaExports;
