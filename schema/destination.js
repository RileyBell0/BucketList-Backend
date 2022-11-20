const mongoose = require("mongoose");
const { Schema } = mongoose;

const destinationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    locationName: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    continent: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Dining", "Landmark", "Arts", "Nature", "Other"],
      required: true,
    },
    visited: {
      type: Boolean,
      required: true,
    },
    desc: String,
    imgLink: String,
    imgDeleteHash: String,
    position: [
      {
        lat: Number,
        lng: Number,
      },
    ],
    trip: {
      type: String,
    },
  },
  { timestamps: true }
);

const Destination = mongoose.model("Destination", destinationSchema);
module.exports = Destination;
