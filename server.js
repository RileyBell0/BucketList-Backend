const port = process.env.PORT || 8080;
const app = require("./index");

app.listen(port, () => {
  console.log("Listening on port " + port);
});
