const destinationAPI = require("../api/destinationApi");
const { checkAuthenticated } = require("../auth/auth");
const settingsAPI = require("../api/settingsApi");
const themeApi = require("../api/themeApi");
const tripApi = require("../api/tripApi");
const express = require("express");
const router = express.Router();

/*
 * Destinations
 */
router.post(
  "/addDestination/",
  checkAuthenticated,
  destinationAPI.addDestination
);
router.post(
  "/updateDestination/:destinationID/:changeImage?",
  checkAuthenticated,
  destinationAPI.updateDestination
);
router.post(
  "/deleteDestination/:destinationID",
  checkAuthenticated,
  destinationAPI.deleteDestination
);
router.get(
  "/getDestinations/:tripID?",
  checkAuthenticated,
  destinationAPI.getDestinations
);
router.get(
  "/getDestination/:destination",
  checkAuthenticated,
  destinationAPI.getDestination
);

/*
 * Trips
 */
router.post(
  "/newTrip",
  checkAuthenticated,
  tripApi.tripSchemaCheck,
  tripApi.newTrip
);
router.post(
  "/updateTrip/:id",
  checkAuthenticated,
  tripApi.tripUpdateSchemaCheck,
  tripApi.updateTrip
);
router.post(
  "/deleteTrip/:id",
  checkAuthenticated,
  tripApi.tripDeleteSchemaCheck,
  tripApi.deleteTrip
);
router.get("/getTrips", checkAuthenticated, tripApi.getTrips);
router.get("/getTrip/:id", checkAuthenticated, tripApi.getTrip);

/*
 * Settings
 */
router.post(
  "/changePassword",
  checkAuthenticated,
  (req, res, next) => {
    console.log(req.body);
    next();
  },
  settingsAPI.changePasswordSchemaCheck,
  settingsAPI.changePassword
);
router.get("/getSettings", checkAuthenticated, settingsAPI.getSettings);

/*
 * Themes
 */
router.post("/updateTheme", checkAuthenticated, themeApi.updateTheme);
router.get("/getTheme", checkAuthenticated, themeApi.getTheme);

module.exports = router;
