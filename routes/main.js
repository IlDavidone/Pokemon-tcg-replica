const router = require("express").Router();
const passport = require("passport");
const generatePassword = require("../lib/passwordUtils").generatePassword;
const connection = require("../config/database");
const User = connection.models.User;
const Card = connection.models.Card;
const isAuth = require("./auth").isAuth;
const isNotAuth = require("./auth").isNotAuth;
const isAdmin = require("./auth").isAdmin;
const addCardToUserCollection =
  require("../controllers/cardUtils").addCardToUserCollection;
const packOpening = require("../controllers/packsLogic").packOpening;

require("dotenv").config();

//testing purposes section

//end of testing purposes section

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/home",
  }),
  (req, res) => {
    if (req.body.remember) {
      req.session.cookie.maxAge = 14 * 24 * 60 * 60 * 1000;
    } else {
      req.session.cookie.expires = false;
    }
  }
);

router.post("/register", async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });

    if (existingUser) {
      return res
        .status(400)
        .send("User already exists. Please choose another username.");
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

router.post("/admin", async (req, res, next) => {
  addCardToUserCollection(req.body.usernameCard, req.body.cardId);
  res.render("admin");
});

router.get("/", (req, res, next) => {
  res.send(
    '<h1>Home</h1><p>Please <a href="/register">Register</a> or <a href="/login">Login</a></p>'
  );
});

router.get("/home", isAuth, (req, res, next) => {
  res.render("home", { username: req.user.username });
});

router.get("/login", isNotAuth, (req, res, next) => {
  res.render("login");
});

router.get("/register", isNotAuth, (req, res, next) => {
  res.render("register");
});

router.get("/protected-route", isAuth, (req, res, next) => {
  res.send("Auth route test");
});

router.get("/admin", isAdmin, (req, res, next) => {
  res.render("admin");
});

router.get("/friends", isAuth, async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const friendList = await user.friendsList;
  res.render("friends", { friends: friendList });
});

router.get("/remove-friend/:userId", isAuth, async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const targetFriend = await User.findById(req.params.userId);

  targetFriend.friendsList = targetFriend.friendsList.filter(
    (friend) => String(friend.id) !== String(req.user._id)
  );
  await targetFriend.save();

  user.friendsList = user.friendsList.filter(
    (friend) => String(friend.id) !== String(req.params.userId)
  );
  await user.save();

  res.redirect("/friends");
});

router.get("/friend-requests", isAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const incomingRequests = user.friendRequests || [];
    res.render("friendsReq", { requests: incomingRequests });
  } catch (err) {
    next(err);
  }
});

router.post("/friend-requests/accept", isAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).send("User not found.");

    const request = user.friendRequests.id(req.body.requestId);
    if (!request) return res.status(404).send("Friend request not found.");

    request.acceptation = true;

    user.friendsList.push({
      id: request.id,
      username: request.username,
      dateAdded: new Date(),
    });

    const requester = await User.findOne({ username: request.username });
    if (requester) {
      requester.friendsList.push({
        id: user._id,
        username: user.username,
        dateAdded: new Date(),
      });
      await requester.save();
    }

    await user.save();
    res.redirect("/friend-requests");
  } catch (err) {
    next(err);
  }
});

router.post("/add-friends", isAuth, async (req, res, next) => {
  try {
    const targetFriend = await User.findOne({ username: req.body.username });
    const user = await User.findById(req.user._id);

    if (!targetFriend) {
      return res.redirect("/friends");
    }

    const alreadyRequested = targetFriend.friendRequests.some(
      (reqObj) => String(reqObj.id) === String(user._id)
    );

    const alreadyFriends = targetFriend.friendsList.some(
      (friend) => String(friend.id) === String(user._id)
    );

    if (!alreadyRequested && !alreadyFriends) {
      targetFriend.friendRequests.push({
        id: user._id,
        username: user.username,
        dateAdded: new Date(),
      });
      await targetFriend.save();
    }

    res.redirect("/friends");
  } catch (err) {
    console.error(err);
    res.redirect("/friends");
  }
});

router.get("/open-pack", isAuth, async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const cards = await Card.find({});
  res.render("packOpening", { cards: cards, energy: user.packEnergy });
});

router.post("/open-pack/base-set", isAuth, async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (user.packEnergy >= 1) {
    const cards = await packOpening(req.user._id);
    console.log(cards);
    user.packEnergy -= 1;
    await user.save();
    res.render("packContent", { cards: cards });
  } else {
    res.redirect("/open-pack");
  }
});

router.get("/send-trade/:userId", isAuth, async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const targetFriend = await User.findById(req.params.userId);

  const userCards = user.cardsCollection.filter((c) => c.quantity > 2);
  const targetFriendCards = targetFriend.cardsCollection.filter(
    (c) => c.quantity > 2
  );

  const userCardsIds = userCards.map((c) => c.card);
  const targetFriendCardsIds = targetFriendCards.map((c) => c.card);

  const userCardsInfo = await Promise.all(
    userCardsIds.map(async (id) => {
      return await Card.findOne({ id: id });
    })
  );

  const targetFriendCardsInfo = await Promise.all(
    targetFriendCardsIds.map(async (id) => {
      return await Card.findOne({ id: id });
    })
  );

  res.render("sendTrade", {
    userCards: userCardsIds,
    userCardsInfo: userCardsInfo,
    targetFriendCards: targetFriendCardsIds,
    targetFriendCardsInfo: targetFriendCardsInfo,
  });
});

router.post("/send-trade", isAuth, async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const targetUser = await User.findOne({ username: req.body.username });

  const cardsGiven = Array.isArray(req.body.cardGiven)
    ? req.body.cardGiven.map((cardId) => ({ card: cardId }))
    : [{ card: req.body.cardGiven }];

  const cardsReceived = Array.isArray(req.body.cardReceived)
    ? req.body.cardReceived.map((cardId) => ({ card: cardId }))
    : [{ card: req.body.cardReceived }];

  const cardEntry = targetUser.cardsCollection.find(
    (entry) => String(entry.card) === String(req.body.cardReceived)
  );

  if (cardEntry) {
    targetUser.tradeRequests.push({
      fromUser: user.username,
      cardsGiven,
      cardsReceived,
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      acceptation: false,
    });

    await targetUser.save();
    res.redirect("/send-trade");
  } else {
    res.redirect("/home");
  }
});

router.get("/collection", isAuth, async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const collectionArr = user.cardsCollection;

  const cardsInfo = await Promise.all(
    collectionArr.map(async (element) => {
      return await Card.findOne({ id: element.card });
    })
  );

  const cardArr = cardsInfo.filter(Boolean);

  res.render("collection", { cards: cardArr });
});

router.get("/collection/:cardId", isAuth, async (req, res, next) => {
  const reqCardId = req.params.cardId;
  const selectedCard = await Card.findOne({ id: reqCardId });
  const user = await User.findById(req.user._id);
  const collectionArr = user.cardsCollection;

  const selectedCardQuantity = await collectionArr.find(
    (entry) => entry.card == reqCardId
  );
  console.log(selectedCardQuantity.quantity);

  res.render("cardPage", {
    card: selectedCard,
    selectedCardQty: selectedCardQuantity,
  });
});

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

module.exports = router;
