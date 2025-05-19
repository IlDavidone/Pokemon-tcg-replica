const mongoose = require('mongoose');

require('dotenv').config();

const dbConnection = process.env.DB_ACCESS_STRING;

const connection = mongoose.createConnection(dbConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const UserSchema = new mongoose.Schema({
    username: String,
    hash: String,
    salt: String,
    admin: Boolean
});

const User = connection.model('User', UserSchema);

const typesSchema = new mongoose.Schema({
    typeOne: String,
    typeTwo: String,
    typeThree: String
});

const abilitiesSchema = new mongoose.Schema({
    name: String,
    text: String,
    type: String
});

const energyCostSchema = new mongoose.Schema({
    energyOne: String,
    energyTwo: String,
    energyThree: String,
    energyFour: String,
    energyFive: String
})

const attackOneSchema = new mongoose.Schema({
    name: String,
    cost: energyCostSchema,
    damage: String,
    text: String
});
const attackTwoSchema = new mongoose.Schema({
    name: String,
    cost: energyCostSchema,
    damage: String,
    text: String
});
const attackThreeSchema = new mongoose.Schema({
    name: String,
    cost: energyCostSchema,
    damage: String,
    text: String
});

const generalAttacksSchema = new mongoose.Schema({
    attackOne: attackOneSchema,
    attackTwo: attackTwoSchema,
    attackThree: attackThreeSchema
});

const CardSchema = new mongoose.Schema({
    id: String,
    name: String,
    supertype: String,
    hp: Number,
    types: typesSchema,
    evolvesFrom: String,
    abilities: abilitiesSchema,
    attacks: generalAttacksSchema,
})

const Cards = connection.model('Card', CardSchema);

module.exports = connection;