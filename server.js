const port = process.env.PORT || 8080;
const app = require("./api/index");

app.listen(port, () => {
  console.log("Listening on port " + port);
});
