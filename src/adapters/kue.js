const kue = require('kue');
const queue = kue.createQueue({
    redis: process.env.REDIS_CONNECTION_STRING
});

queue.setMaxListeners(1000) // <- golden method

queue.on('error', (err) => {
    console.log(err);
});

module.exports = {
    init: kue,
    queue
};