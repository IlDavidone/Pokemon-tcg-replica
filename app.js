const http = require("http");
const path = require("node:path");
const express = require("express");
const app = express();
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const sessionStore = new MongoStore({ mongooseConnection: connection, collection: 'sessions' });

const sharedSession = require("express-socket.io-session");

const sessionMiddleware = session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
});

app.use(sessionMiddleware);
io.use(sharedSession(sessionMiddleware, { autoSave: true }));


require('./config/passport');

console.log("Initializing passport...");
app.use(passport.initialize());
app.use(passport.session());
console.log("Done! Passport initialized.");

app.use("/", testRouter);

startEnergyRestoreScheduler();

const User = connection.models.User;

io.on("connection", async (socket) => {
    const userId = socket.handshake.session?.passport?.user;
    if (userId) {
        const user = await User.findByIdAndUpdate(userId, { online: true }, { new: true });
        if (user) {
            console.log(`(DBG) User ${user.username} connected and set online`);
        } else {
            console.log("(DBG) User not found for id:", userId);
        }
    }

    socket.on("disconnect", async () => {
        const userId = socket.handshake.session?.passport?.user;
        if (userId) {
            const user = await User.findByIdAndUpdate(userId, { online: false }, { new: true });
        }
    });
});


server.listen(process.env.PORT, () => {
    console.log(`The server is listening on port ${process.env.PORT}`);
});

addCardToUserCollection("admin", "test");

console.log("(DBG) Server started.");
