const _ = require('lodash');
const csvToJson = require('../libs/csvToJson');
const kue = require('../adapters/kue');
// Assign worker to process a job of particular type
// 5 is the maximum number of concurrent jobs our worker will pick up.
// Can be more if you want it to be. Can be less. Figure out your case and load.
kue.queue.process('populate_data_worker', async (job, done) => populateData(job, done));

// Actual function executed by the worker
const populateData = (job, done) => {
    // Delegated to the external function to manage promises efficiently
    // job.data contains the data passed for the job execution
    run(job.data).then((data) => {
            done();
        })
        .catch((err) => {
            // Now this is where you go crazy with the error handling.
            // In this snippet, say the broker service gives me something in the 400 Error Range,
            // it implies something is wrong with the request itself. Retrying in this case will
            // be redundant hence, I reset the job retries to be 0
            // NOTE: You can skip this bit entirely. It's just bells and whistles to show a bit
            // of kue's capabilities.
            return done(new Error(JSON.stringify(err))); // OTherwise scenario, keep trying.
        });
};

const run = ({
    filePath
}) => {
    // It either succeeds (YAY!) or fails in a manner to deserve a retry or fails with
    // a 400 series error.
    return new Promise(async (resolve, reject) => {
        // setup paramaters
        try {
            //convert data csv to json;
            let collectionUsers = await csvToJson(filePath);

            await Promise.all(_.map(collectionUsers, params => {
                return registerWorker(params);
            }));

            resolve(collectionUsers);
        }
        catch (err) {
            reject(err);
        }
    });
};

const registerWorker = (params) => {
     return kue.queue.create('user_register_worker', params)
         .attempts(3) // The maximum number of retries you want the job to have
         .backoff({
             delay: 60 * 1000,
             type: 'exponential'
         }) // Time between retries. Read docs.
         .save();
};