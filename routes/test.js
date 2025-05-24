const router = require("express").Router();
const passport = require("passport");
const generatePassword = require("../lib/passwordUtils").generatePassword;
const connection = require("../config/database");
const User = connection.models.User;
const Card = connection.models.Card;
const isAuth = require("./auth").isAuth;
const isNotAuth = require("./auth").isNotAuth;
const isAdmin = require("./auth").isAdmin;

require("dotenv").config();

//testing purposes section

//end of testing purposes section

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/home",
  })
);

router.post("/register", async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });
    
    if (existingUser) {
      return res.status(400).send("User already exists. Please choose another username.");
    }

    const saltHash = generatePassword(req.body.password);
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    const newUser = new User({
      username: req.body.username,
      hash: hash,
      salt: salt,
      admin: false,
    });

    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    next(err);
  }
});

router.get("/", (req, res, next) => {
  res.send('<h1>Home</h1><p>Please <a href="/register">Register</a> or <a href="/login">Login</a></p>');
});

router.get("/home", isAuth, (req, res, next) => {
  res.render("home", { username: req.user.username } );
}) 

router.get("/login", isNotAuth, (req, res, next) => {
  res.render("login");
});

router.get("/register", isNotAuth, (req, res, next) => {
  res.render("register");
});

router.get("/protected-route", isAuth, (req, res, next) => {
  res.send("Auth route test");
});

router.get("/admin-route", isAdmin, (req, res, next) => {
  res.send("Admin route test");
});

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
