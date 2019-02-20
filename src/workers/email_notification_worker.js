const kue = require('../adapters/kue');
const mailTransport = require('../adapters/nodemailer');
// Assign worker to process a job of particular type
// 5 is the maximum number of concurrent jobs our worker will pick up.
// Can be more if you want it to be. Can be less. Figure out your case and load.
kue.queue.process('email_notification_worker', async (job, done) => sendEmail(job, done));

// Actual function executed by the worker
const sendEmail = (job, done) => {
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
    email,
    firstName
}) => {
    // It either succeeds (YAY!) or fails in a manner to deserve a retry or fails with
    // a 400 series error.
    return new Promise(async (resolve, reject) => {
        // setup paramaters
        try {
            let mailOptions = {
                from: 'info@dn.id', // sender address
                to: email, // list of receivers
                subject: "Registration Successful", // Subject line
                html: `<p></p><br>
                       Hi ${firstName}<br>
                    Thank you for registering for the event.<br><br>` // html body
            };

            console.log('mailOptions', mailOptions);
            //send email user registered.
            let info = await mailTransport.sendMail(mailOptions);
            console.log("Message sent: %s", info.messageId);
            resolve(info);
        } catch (err) {
            console.log('SEND EMAIL FAILED', err);
            reject(err);
        }
    });
};
