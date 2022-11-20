// This file contains functions used for destination related api
const { Trip } = require("../schema/trip");
const Destination = require("../schema/destination");
const Imgur = require("../imgur/imgur");
const formidable = require("formidable");
const fs = require("fs");
const contentType = require("content-type");
const response = require("../util/response");

async function doesTripExist(user, tripName) {
  await user.populate("trips");

  const names = user.trips.map((item) => {
    return item.name;
  });
  if (names.includes(tripName)) {
    return true;
  }
  return false;
}

async function addDestination(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(404).send("Couldn't find user");

    const requestType = contentType.parse(req).type;

    if (requestType === "application/json") {
      // Ensure trip exists, or set to "None"
      if (
        req.body.trip &&
        (await doesTripExist(req.user, req.body.trip)) === false
      ) {
        req.body.trip = "None";
      }

      const newDest = new Destination(req.body);
      await user.populate("destinations");
      await newDest.save();
      user.destinations.push(newDest);
      await user.save();

      return res.sendStatus(201);
    } else if (requestType === "multipart/form-data") {
      // Read form
      const form = formidable({ multiples: true });
      form.parse(req, async (err, fields, files) => {
        try {
          // Ensure the trip is valid, or set to "None"
          if (fields.trip) {
            if ((await doesTripExist(req.user, fields.trip)) === false) {
              fields.trip = "None";
            }
          }
          const dest = fields;

          // Add Imgur link and delete hash if an image exist
          if (files.img) {
            if (files.img.size > 5 * 1024 * 1024)
              return res.status(400).send("Image is too big");
            if (!files.img.mimetype.match("image.*"))
              return res.status(400).send("File type is invaild");
            const imgPath = fs.createReadStream(files.img.filepath);
            const upload = await Imgur.uploadImage(imgPath);
            dest.imgLink = upload.link;
            dest.imgDeleteHash = upload.deleteHash;
          }

          const newDest = new Destination(dest);
          await user.populate("destinations");
          await newDest.save();
          user.destinations.push(newDest);
          await user.save();
          res.sendStatus(201);
        } catch (err) {
          console.log(err);
          res.status(400).json({ error: err.toString() });
        }
      });
    } else {
      return res.status(400).send("Invalid content type.");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.toString() });
  }
}

async function getDestinations(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(404).send("Couldn't find user");

    await user.populate("destinations");

    if (req.params.tripID) {
      // Ensure the user is allowed to access this trip
      const id = req.params.tripID;
      if (!user.trips.includes(id)) {
        console.log("Does not include");
        console.log(id);
        return response.send(res, response.STATUS_FORBIDDEN, {
          error: "Access Denied",
        });
      }

      // Return relevant destinations
      const trip = await Trip.findById(id);
      const relevantDestinations = user.destinations.filter(
        (dest) => dest.trip === trip.name
      );
      return response.send(res, response.STATUS_OK, relevantDestinations);
    } else {
      return response.send(res, response.STATUS_OK, user.destinations);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.toString() });
  }
}

async function getDestination(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(404).send("Couldn't find user");

    // Ensure the user is allowed to access this destination
    const id = req.params.destination;
    if (!user.destinations.includes(id)) {
      return response.send(res, response.STATUS_FORBIDDEN, {
        error: "Access Denied",
      });
    }

    // Get the destination
    const dest = await Destination.findById(req.params.destination);
    return response.send(res, 200, {
      destination: dest,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.toString() });
  }
}

async function updateDestination(req, res) {
  try {
    console.log("changing destination");
    const dest = await Destination.findById(req.params.destinationID);
    if (!dest) return res.status(404).send("Couldn't find destination");

    const user = req.user;
    if (!user) return res.status(404).send("Couldn't find user");
    await user.populate("destinations");

    if (
      !user.destinations.some(
        (x) => x._id.toString() === req.params.destinationID
      )
    ) {
      return res.status(401).send("unauthorized to change this destination");
    }
    const requestType = contentType.parse(req).type;
    console.log("content type:", requestType);

    if (requestType === "application/json") {
      // Ensure trip exists, or set to "None"
      if (
        req.body.trip &&
        (await doesTripExist(req.user, req.body.trip)) === false
      ) {
        req.body.trip = "None";
      }

      for (const key in req.body) {
        console.log(key);
        dest[key] = req.body[key];
      }
      await dest.save();
      res.sendStatus(201);
    } else if (requestType === "multipart/form-data") {
      const form = formidable({ multiples: true });
      form.parse(req, async (err, fields, files) => {
        // Ensure the trip is valid, or set to "None"
        if (fields.trip) {
          if ((await doesTripExist(req.user, fields.trip)) === false) {
            fields.trip = "None";
          }
        }

        // Check if we are changing the image
        const updatedDest = fields;
        console.log("FORM");
        if (req.params.changeImage === "true") {
          // Delete imgur link of current destination
          if (dest.imgDeleteHash !== "") {
            await Imgur.deleteImage(dest.imgDeleteHash);
          }

          // Check if we are removing the image or replacing it
          if (files.img) {
            //CASE 1: Replacing the image
            if (files.img.size > 5 * 1024 * 1024)
              return res.status(400).send("Image is too big");
            if (!files.img.mimetype.match("image.*"))
              return res.status(400).send("File type is invaild");
            const imgPath = fs.createReadStream(files.img.filepath);
            const upload = await Imgur.uploadImage(imgPath);
            updatedDest.imgLink = upload.link;
            updatedDest.imgDeleteHash = upload.deleteHash;
          } else {
            //CASE 2: Removing the image
            updatedDest.imgLink = undefined;
            updatedDest.imgDeleteHash = undefined;
          }
        }

        for (const key in updatedDest) {
          dest[key] = updatedDest[key];
        }

        //Super scuffed way of changing the position
        //Problems occurs because of how formidable parses objects
        if (updatedDest["position.0.lat"] !== undefined) {
          const newPos = {
            lat: updatedDest["position.0.lat"],
            lng: updatedDest["position.0.lng"],
          };
          dest["position"] = newPos;
        }

        try {
          await dest.save();
        } catch (e) {
          // TODO do something meaningful with this
          console.log("ERROR, the schema was violated");
          return response.send(res, response.STATUS_BAD_REQUEST, {
            error: "Invalid state",
          });
        }
        res.sendStatus(201);
      });
    } else {
      res.status(400).send("Invalid content type.");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.toString() });
  }
}

async function deleteDestinationBackend(user, id) {
  const dest = await Destination.findById(id);
  if (dest.imgDeleteHash !== "") {
    await Imgur.deleteImage(dest.imgDeleteHash);
  }

  await Destination.deleteOne({
    _id: id,
  });

  user.destinations = user.destinations.filter(
    (dest) => dest._id.toString() !== id
  );

  await user.save();
}

async function deleteDestination(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(404).send("Couldn't find user");

    user.populate("destinations");
    if (
      !user.destinations.some(
        (x) => x._id.toString() === req.params.destinationID
      )
    ) {
      return res.status(401).send("unauthorized to change this destination");
    }

    // Delete Imgur link
    const dest = await Destination.findById(req.params.destinationID);
    if (dest.imgDeleteHash != "") {
      await Imgur.deleteImage(dest.imgDeleteHash);
    }

    const deletionRes = await Destination.deleteOne({
      _id: req.params.destinationID,
    });

    if (deletionRes.deletedCount == 0)
      return res.status(404).send("Couldn't find destination");

    user.destinations = user.destinations.filter(
      (dest) => dest._id.toString() !== req.params.destinationID
    );
    await user.save();

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.toString() });
  }
}

const destinationAPI = {
  addDestination: addDestination,
  getDestinations: getDestinations,
  getDestination: getDestination,
  updateDestination: updateDestination,
  deleteDestination: deleteDestination,
  deleteDestinationBackend: deleteDestinationBackend,
};

module.exports = destinationAPI;
