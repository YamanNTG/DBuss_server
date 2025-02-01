const nodemailer = require('nodemailer');
const nodemailerConfig = require('./nodemailerConfig');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmailEth = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport(nodemailerConfig);

  return transporter.sendMail({
    from: '"Claudiu Coding" <claudiuoprea21@gmail.com>', // sender address
    to,
    subject,
    html,
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const msg = {
      to,
      from: 'claudiuoprea21@gmail.com', // Use the email address or domain you verified above
      subject,
      text,
      html,
    };
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending email via SendGrid:', error);
    throw error;
  }
};

module.exports = { sendEmailEth, sendEmail };
