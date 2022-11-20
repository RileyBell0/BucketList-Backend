const response = require("../util/response");
const { validThemes } = require("../schema/user");

async function updateTheme(req, res) {
  try {
    // Validate user
    const user = req.user;
    if (!user) return res.status(404).send("Couldn't find user");

    // If dark mode field was received, update it
    let saveUser = false;
    if (req.body.darkMode !== undefined) {
      user.darkMode = req.body.darkMode;
      saveUser = true;
    }

    // If an update to useSystemTheme was received, update it
    if (
      req.body.useSystemTheme !== undefined &&
      req.body.useSystemTheme !== user.useSystemTheme
    ) {
      user.useSystemTheme = req.body.useSystemTheme;
      saveUser = true;
    }

    // Set theme if a valid theme was provided
    if (req.body.theme !== undefined) {
      // Validate theme
      const theme = req.body.theme.toString().toLowerCase();
      if (validThemes.some((element) => element.toLowerCase() === theme)) {
        if (user.theme !== req.body.theme) {
          user.theme = req.body.theme;
          saveUser = true;
        }
      } else {
        return res.status(404).send("Invalid theme provided");
      }
    }

    if (saveUser) {
      await user.save();
    }

    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.toString() });
  }
}

async function getTheme(req, res) {
  // Validate user
  if (!req.user) return res.status(404).send("Couldn't find user");

  res.status(response.STATUS_OK);
  res.json({
    theme: req.user.theme,
    darkMode: req.user.darkMode,
    useSystemTheme: req.user.useSystemTheme,
  });
}

const themeApi = {
  updateTheme: updateTheme,
  getTheme: getTheme,
};

module.exports = themeApi;
