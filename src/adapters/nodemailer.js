const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: process.env.MAIL_SMTP_HOST,
    port: process.env.MAIL_SMTP_PORT
});

module.exports = transporter;