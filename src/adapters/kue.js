const kue = require('kue');
kue.createQueue({
    redis: process.env.REDIS_CONNECTION_STRING
});

module.exports = kue;