const response = require("../util/response");
const {
  Trip,
  tripJoiSchema,
  tripJoiUpdateSchema,
  tripJoiDeleteSchema,
} = require("../schema/trip");
const { deleteDestinationBackend } = require("./destinationApi.js");

function doesTripExist(trips, tripName) {
  const names = trips.map((item) => {
    return item.name.toLowerCase();
  });
  return !!names.includes(tripName.toLowerCase());
}

async function getTrips(req, res) {
  await req.user.populate("trips");

  return response.send(res, response.STATUS_OK, { trips: req.user.trips });
}

async function newTrip(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(404).send("Couldn't find user");

    // Default empty description
    if (!req.body.desc) {
      req.body.desc = "";
    }

    // Remove outside whitespace, ensure name is at least 1 char long
    req.body.name = req.body.name.trim();
    if (req.body.name.toLowerCase() === "none") {
      return response.send(res, response.STATUS_BAD_REQUEST, {
        error: 'Trip name "None" is reserved',
      });
    }
    if (req.body.name.toLowerCase() === "all") {
      return response.send(res, response.STATUS_BAD_REQUEST, {
        error: 'Trip name "All" is reserved',
      });
    }
    if (req.body.name === "") {
      return response.send(res, response.STATUS_BAD_REQUEST, {
        error: "Trip name cannot be empty",
      });
    }

    // Prepare the new trip
    req.body.user = user._id;
    const newTrip = new Trip(req.body);

    // Ensure the trip name doesn't already exist
    await user.populate("trips");
    const names = user.trips.map((item) => {
      return item.name.toLowerCase();
    });
    if (names.includes(req.body.name.toLowerCase())) {
      return response.send(res, response.STATUS_BAD_REQUEST, {
        error: "Error: Trip name already exists",
      });
    }

    // Save the trip to the user
    await newTrip.save();
    user.trips.push(newTrip);
    await user.save();

    // Send response with the new id
    return response.send(res, 200, {
      message: "Success",
      id: newTrip._id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.toString() });
  }
}

async function updateTrip(req, res) {
  // Update the trip
  // Get all associated destinations
  try {
    const id = req.params.id;
    const user = req.user;
    if (!user)
      return response.send(res, 404, { error: "Error: Couldn't find user" });

    // Ensure the trip exists within the user
    if (!user.trips.some((trip) => trip._id.toString() === id)) {
      return response.send(res, 404, {
        error: "Error: unauthorized to change this trip",
      });
    }

    // Get the associated Trip
    const trip = await Trip.findById(id);
    if (!trip)
      return response.send(res, 404, { error: "Error: Couldn't find trip" });
    const oldName = trip.name;

    if (req.body.name) {
      // Remove outside whitespace, ensure name is at least 1 char long
      req.body.name = req.body.name.trim();
      if (req.body.name.toLowerCase() === "none") {
        return response.send(res, response.STATUS_BAD_REQUEST, {
          error: 'Trip name "None" is reserved',
        });
      }
      if (req.body.name.toLowerCase() === "all") {
        return response.send(res, response.STATUS_BAD_REQUEST, {
          error: 'Trip name "All" is reserved',
        });
      }
      if (req.body.name === "") {
        return response.send(res, response.STATUS_BAD_REQUEST, {
          error: "Trip name cannot be empty",
        });
      }

      // Ensure the trip name doesn't already exist
      if (trip.name.toLowerCase() !== req.body.name.toLowerCase()) {
        await user.populate("trips");
        if (
          user.trips.some(
            (trip) => trip.name.toLowerCase() === req.body.name.toLowerCase()
          )
        ) {
          return response.send(res, 404, {
            error: "Error: Trip name already exists",
          });
        }
      }
      trip.name = req.body.name;
    }

    // Update the Description
    if (req.body.desc) {
      trip.desc = req.body.desc.trim();
    }

    await trip.save();

    // Update associated destinations to use the new name
    if (req.body.name) {
      await user.populate("destinations");
      const relevantDestinations = user.destinations.filter(
        (dest) => dest.trip === oldName
      );
      for (let i in relevantDestinations) {
        const dest = relevantDestinations[i];
        dest.trip = trip.name;
        await dest.save();
      }
    }

    // Success (woohoo)
    return response.send(res, response.STATUS_OK, {});
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.toString() });
  }
}

async function deleteTrip(req, res) {
  try {
    const id = req.params.id;

    const user = req.user;
    if (!user) return res.status(404).send("Couldn't find user");

    // Ensure the trip exists within the user
    if (!user.trips.some((trip) => trip._id.toString() === id)) {
      return res.status(401).send("unauthorized to change this trip");
    }

    // Get the associated Trip
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).send("Couldn't find trip");
    const tripName = trip.name;

    // Ensure the trip name matches that passed
    if (tripName !== req.body.name) {
      return response.send(res, response.STATUS_BAD_REQUEST, {
        error: "Incorrect Trip Name Received",
      });
    }

    // Try to delete the trip
    const deletionRes = await Trip.deleteOne({
      _id: id,
    });
    if (deletionRes.deletedCount == 0)
      return res.status(404).send("Couldn't find trip");
    user.trips = user.trips.filter((trip) => trip._id.toString() !== id);
    await user.save();

    // Modify associated destinations
    await user.populate("destinations");
    const relevantDestinations = user.destinations.filter(
      (dest) => dest.trip === tripName
    );
    if (req.body.deleteDestinations) {
      // Delete associated destinations
      for (let i in relevantDestinations) {
        const dest = relevantDestinations[i];
        await deleteDestinationBackend(user, dest._id);
      }
    } else {
      // Set associated destinations to "None"
      for (let i in relevantDestinations) {
        const dest = relevantDestinations[i];
        dest.trip = "None";
        await dest.save();
      }
    }

    // Success (woohoo)
    return response.send(res, response.STATUS_OK, {});
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.toString() });
  }
}

function tripUpdateSchemaCheck(req, res, next) {
  const { error } = tripJoiUpdateSchema.validate(req.body);
  if (error !== undefined) {
    return response.send(res, response.STATUS_BAD_REQUEST, {
      message: error.message,
    });
  }
  next();
}

function tripDeleteSchemaCheck(req, res, next) {
  const { error } = tripJoiDeleteSchema.validate(req.body);
  if (error !== undefined) {
    return response.send(res, response.STATUS_BAD_REQUEST, {
      message: error.message,
    });
  }
  next();
}

function tripSchemaCheck(req, res, next) {
  const { error } = tripJoiSchema.validate(req.body);
  if (error !== undefined) {
    return response.send(res, response.STATUS_BAD_REQUEST, {
      message: error.message,
    });
  }
  next();
}

async function getTrip(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(404).send("Couldn't find user");

    // Ensure the user is allowed to access this trip
    const id = req.params.id;
    if (!user.trips.includes(id)) {
      console.log("Does not include");
      console.log(id);
      return response.send(res, response.STATUS_FORBIDDEN, {
        error: "Access Denied",
      });
    }

    // Get the trip
    const trip = await Trip.findById(id);

    // Get the trip names
    await user.populate("trips");
    const tripNames = user.trips.map((currentTrip) => currentTrip.name);

    // Get associated destinations
    await user.populate("destinations");
    const relevantDestinations = user.destinations.filter(
      (dest) => dest.trip === trip.name
    );

    return response.send(res, response.STATUS_OK, {
      trip: trip,
      tripNames: tripNames,
      destinations: relevantDestinations,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.toString() });
  }
}

const tripAPI = {
  newTrip: newTrip,
  tripDeleteSchemaCheck: tripDeleteSchemaCheck,
  tripUpdateSchemaCheck: tripUpdateSchemaCheck,
  tripSchemaCheck: tripSchemaCheck,
  doesTripExist: doesTripExist,
  getTrips: getTrips,
  getTrip: getTrip,
  updateTrip: updateTrip,
  deleteTrip: deleteTrip,
};

module.exports = tripAPI;
