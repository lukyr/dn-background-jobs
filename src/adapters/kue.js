const kue = require('kue');
const queue = kue.createQueue({
    redis: process.env.REDIS_CONNECTION_STRING
});

module.exports = {
    init: kue,
    queue
};