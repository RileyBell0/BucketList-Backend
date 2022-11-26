const mongoose = require("mongoose");
const { Schema } = mongoose;

const validThemes = ["Default", "Eucalyptus", "Sandy"];

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  theme: {
    type: String,
    enum: validThemes,
    default: "Default",
  },
  darkMode: {
    type: Boolean,
    default: false,
  },
  useSystemTheme: {
    type: Boolean,
    default: true,
  },
  destinations: [
    {
      type: Schema.Types.ObjectId,
      ref: "Destination",
    },
  ],
  trips: [
    {
      type: Schema.Types.ObjectId,
      ref: "Trip",
    },
  ],
});

const User = mongoose.model("User", userSchema);
const userSchemaExports = {
  User: User,
  validThemes: validThemes,
};
module.exports = userSchemaExports;
