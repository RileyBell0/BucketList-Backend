const apiRouter = require("./routers/apiRouter");
const authRouter = require("./routers/authRouter");
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("./auth/passportConfig");
const db = require("./db");
const response = require("./util/response");
const cookieParser = require("cookie-parser");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

let origins;
if (process.env.ALL_ORIGINS === "TRUE") {
  origins = true;
} else {
  origins = [process.env.FRONTEND_URL, process.env.BACKEND_URL];
}

const corsOptions = {
  credentials: true,
  origin: origins,
};

const app = express();

// setup express-session to store sessions in mongodb
// for now accept reqs from all origins
app.enable("trust proxy");
app.use(cors(corsOptions));
app.use(
  session({
    secret: process.env.EXPRESS_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie:
      process.env.SAME_HOST_COOKIE === "TRUE"
        ? {}
        : {
            secure: true,
            sameSite: "None",
            httpOnly: true,
          },
    store: db.sessionStorage,
  })
);
app.use((req, res, next) => {
  console.log("Request origin:", req.get("origin"));
  next();
});
app.use(flash());
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  console.log("With session", req.sessionID);
  console.log(
    "Is request authenticated?",
    req.isAuthenticated() ? "Yes" : "No"
  );
  console.log("desired endpoint:", req.path);
  console.log("cookies:", req.cookies);
  next();
});

app.use(apiRouter);
app.use(authRouter);

///////////////////////////////////////
// Express
///////////////////////////////////////

app.get("*", (req, res) => {
  response.send(res, response.STATUS_OK, { message: "Pink Hippos Backend!!" });
});

module.exports = app;
