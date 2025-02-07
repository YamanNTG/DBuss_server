const { sendEmail } = require('./sendEmail');

const sendResetPasswordEmail = async ({
  name,
  email,
  passwordToken,
  origin,
}) => {
  const resetUrl = `${origin}/user/reset-password?token=${passwordToken}&email=${email}`;
  const message = `<p>Reset your password by clicking on the following link <a href="${resetUrl}">Reset Pasword</a></p>`;

  return sendEmail({
    to: email,
    subject: 'Reset Password',
    text: 'Reset your password',
    html: `<h4>Hello,${name}</h4>
    ${message}
    `,
  });
};

module.exports = sendResetPasswordEmail;
