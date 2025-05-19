const http = require("http");
const path = require("node:path");
const express = require("express");
const session = require('express-session');
const mongoose = require("mongoose");
const connection = require("./config/database");
const indexRouter = require("./routes/indexRouter");
const testRouter = require("./routes/test");
const authMiddleware = require("./routes/auth");
var crypto = require("crypto");
var passport = require("passport");

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
        maxAge: 1000 * 60 * 60 * 24 * 14 //gave the cookies a duration of 14 days
    }
}));


require('./config/passport');

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    console.log(req.session);
    console.log(req.user);
    next();
});


app.use("/", testRouter);

app.listen(process.env.PORT, () => {
  console.log(`The server is listening on port ${process.env.PORT}`);
});
