// load the config
require('dotenv').config();

const http = require('http');
const express = require('express');
const bodyParser = require ('body-parser');
const multer = require('multer');
const csvToJson = require('./libs/csvToJson');
const User = require('./models/User');
const _ = require('lodash');
const mailTransport = require('./adapters/nodemailer');

var upload = multer({
    dest: 'data/'
})

// initiate express
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.post('/users', upload.single('file'), async ({ file }, res, next) => {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any

    if (file) {
        try {
            let listUsers = await csvToJson(file.path);
            const transformParameter = listUsers.map(user => {
                return {
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    gender: user.gender
                }
            });

            await Promise.all(_.map(transformParameter, async params => {
                try {
                    const user = await User.create(params);
                    let mailOptions = {
                        from: 'info@dn.id', // sender address
                        to: user.email, // list of receivers
                        subject: "Registration Successful", // Subject line
                        html: `<p></p><br>
                           Hi ${user.email}<br>
                           Thank you for registering for the event.<br><br>` // html body
                    };
                    console.log('mailOptions', mailOptions);
                    let info = await mailTransport.sendMail(mailOptions);
                    console.log("Message sent: %s", info.messageId);

                }
                catch (err) {
                    throw err;
                }
                // Preview only available when sending through an Ethereal account
            })).catch(err => {
                throw err;
            });
            res.status(201).json({
                status: 'ok'
            });
        }
        catch (err) {
            throw err;
        }
    }

});

app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).send(err);
    return next();
});

const server = http.createServer(app);

server.listen(process.env.PORT, () => console.log(`API listen on PORT ${process.env.PORT}`));
