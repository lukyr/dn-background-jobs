const db = require('../adapters/mongoose');
const mongoose = require('mongoose');
let schema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    gender: String,
});
module.exports = db.model('User', schema);