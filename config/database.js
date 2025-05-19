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

module.exports = connection;