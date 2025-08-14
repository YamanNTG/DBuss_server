const nodemailer = require('nodemailer');
const nodemailerConfig = require('./nodemailerConfig');

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = nodemailer.createTransport(nodemailerConfig);

  return await transporter.sendMail({
    from: '"Claudiu Coding" <claudiuoprea21@gmail.com>', // sender address
    to,
    subject,
    html,
    text,
  });
};

module.exports = { sendEmail };
