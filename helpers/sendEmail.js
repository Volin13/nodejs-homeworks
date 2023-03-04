const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const { SENDGRID_API_KEY, FROM_MY_MAIL } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmail = async (data) => {
  const email = { ...data, from: FROM_MY_MAIL };
  await sgMail.send(email);
  return true;
};

module.exports = sendEmail;
