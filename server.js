const port = process.env.PORT || 8080;
const app = require("./app");

app.listen(port, () => {
  console.log("Listening on port " + port);
});
