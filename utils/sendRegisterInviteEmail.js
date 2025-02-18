const { sendEmail } = require('./sendEmail');

const sendRegisterInviteEmail = async ({
  name,
  email,
  registerToken,
  origin,
}) => {
  const registerEmail = `${origin}/register?token=${registerToken}&email=${email}`;
  const message = `<p>You were invited to join the TransitTask app by an admin from yout organization, you can register by clicking on the following link <a href="${registerEmail}">Register</a></p>`;

  return sendEmail({
    to: email,
    subject: 'Register invitation',
    text: 'Register now!',
    html: `<h4>Hello ${name}</h4>
    ${message}
    `,
  });
};

module.exports = sendRegisterInviteEmail;
