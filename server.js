const port = process.env.PORT || 8080;
const app = require("./index");

app.listen(port, () => {
  console.log("listening on port " + port);
});
