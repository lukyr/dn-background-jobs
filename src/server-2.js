// load the config
require('dotenv').config();

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const kue = require('./adapters/kue');
const ui = require('kue-ui');
const path = require('path');
const rootPath = path.resolve('./');

const upload = multer({
    dest: 'data/'
})

// initiate express
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

ui.setup({
    apiURL: '/api', // IMPORTANT: specify the api url
    baseURL: '/kue', // IMPORTANT: specify the base url
    updateInterval: 5000 // Optional: Fetches new data every 5000 ms
});

// Mount kue JSON api
app.use('/api', kue.init.app);
// Mount UI
app.use('/kue', ui.app);


app.post('/users', upload.single('file'), async ({
    file
}, res) => {
    //create job define type
    kue.queue.create('populate_data_worker', {
            filePath: `${rootPath}/${file.path}`
        })
        .attempts(5) // The maximum number of retries you want the job to have
        .backoff({
            delay: 60 * 1000,
            type: 'exponential'
        }) // Time between retries. Read docs.
        .save(); // PERSIST THE DAMN JOB LOL

    res.json({
        status: 'ok',
        message: 'Successfully assigned job to the worker'
    });
});

app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).send(err);
    return next();
});

const server = http.createServer(app);

server.listen(process.env.PORT, () => console.log(`API listen on PORT ${process.env.PORT}`));
