const connection = require("../config/database");
const mongoose = require("mongoose");
const User = connection.models.User;

//add a card to an existing user
async function addCardToUserCollection(username, cardId) {
    const user = await User.findOne({username: username});
    const entry = user.cardsCollection.find(c => String(c.card) === String(cardId));
    if (entry) {
        entry.quantity += 1;
    } else {
        user.cardsCollection.push({ card: cardId, quantity: 1 });
    }
    await user.save();
    console.log("...saved...");
}

//remove a card from an existing user
async function removeCardFromUserCollection(username, cardId) {
    const user = await User.findOne({username: username});
    const entry = user.cardsCollection.find(c => String(c.card) === String(cardId));
    if (entry) {
        entry.quantity -= 1;
        if (entry.quantity <= 0) {
            user.cardsCollection = user.cardsCollection.filter(c => c.card !== cardId);
        }
        await user.save();
    }
}

//export previously declared functions
module.exports.addCardToUserCollection = addCardToUserCollection;
module.exports.removeCardFromUserCollection = removeCardFromUserCollection;
