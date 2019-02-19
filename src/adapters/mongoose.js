const mongoose = require('mongoose');

// we use native ES6 Promises library
// http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise;
const db = mongoose.createConnection(process.env.MONGO_CONNECTION_STRING, {
    useNewUrlParser: true
});

module.exports = db;