const http = require("http");
const path = require("node:path");
const express = require("express");
const session = require('express-session');
const mongoose = require("mongoose");
const connection = require("./config/database");
const testRouter = require("./routes/main");
const authMiddleware = require("./routes/auth");
const crypto = require("crypto");
const passport = require("passport");
const startEnergyRestoreScheduler = require("./controllers/energyRestore");
const addCardToUserCollection = require("./controllers/cardUtils").addCardToUserCollection;

const MongoStore = require('connect-mongo')(session);

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const sessionStore = new MongoStore({ mongooseConnection: connection, collection: 'sessions' });

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 //gave the cookies a duration of 7 days
    }
}));


require('./config/passport');

console.log("Initializing passport...");
app.use(passport.initialize());
app.use(passport.session());
console.log("Done! Passport initialized.");

app.use((req, res, next) => {
    console.log(req.session);
    console.log(req.user);
    next();
});

app.use("/", testRouter);

startEnergyRestoreScheduler();

app.listen(process.env.PORT, () => {
  console.log(`The server is listening on port ${process.env.PORT}`);
});

addCardToUserCollection("admin", "test");

console.log("(DBG) Server started.");
