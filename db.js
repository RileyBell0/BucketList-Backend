const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Connect to db using connection string
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: process.env.MONGO_DB,
});

// Connect to db for session storage
const sessionStorage = MongoStore.create({
  mongoUrl: process.env.MONGO_URL,
  dbName: process.env.MONGO_DB,
  collectionName: "sessions",
});

// Exit on error
const db = mongoose.connection.on("error", (err) => {
  console.error(err);
  process.exit(1);
});

// Log to console once the database is open
db.once("open", async () => {
  console.log(`Mongo connection started on ${db.host}:${db.port}`);
});

module.exports.db = db;
module.exports.sessionStorage = sessionStorage;
