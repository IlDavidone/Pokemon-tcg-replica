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
    admin: Boolean, 
    packEnergy: { type: Number, default: 0, max: 5 },
    lastEnergyRestore: { type: Date, default: null }
});

const User = connection.model('User', UserSchema);

const CardSchema = new mongoose.Schema({
    id: String,
    name: String,
    supertype: String,
    hp: String,
    types: [String],
    evolvesFrom: String,
    evolvesTo: [String],
    abilities: [{
        name: String,
        text: String,
        type: String
    }],
    attacks: [{
        cost: [String],
        name: String,
        damage: String,
        text: String,
        convertedEnergyCost: Number
    }],
    weaknesses: [
    {
        type: { type: String },
        value: String
    }
    ],
    resistances: [
    {
        type: { type: String },
        value: String
    }
    ]
})

const Cards = connection.model('Card', CardSchema);

module.exports = connection;
