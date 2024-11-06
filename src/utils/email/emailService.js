"use strict";

const nodemailer = require("nodemailer");
const { NODEMAILER_EMAIL, NODEMAILER_PASSWORD } = require("../../../setups");
const { CustomError } = require("../../errors/customError");
const { getFeedbackHtml } = require("./feedback/feedback");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: NODEMAILER_EMAIL,
    pass: NODEMAILER_PASSWORD,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Volunteerium" <${NODEMAILER_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent successfully.", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const sendFeedbackEmail = async (name, email, subject, feedback) => {
  try {
    const htmlContent = getFeedbackHtml(name, email, subject, feedback);

    const info = await transporter.sendMail({
      from: `"Volunteerium" <${NODEMAILER_EMAIL}>`,
      to: NODEMAILER_EMAIL,
      subject: `Feedback: ${subject}`,
      html: htmlContent,
    });
    console.log("Email sent successfully.", info.messageId);
  } catch (error) {
    console.error("Email sending error: ", error);
  }
};

module.exports = { sendEmail, sendFeedbackEmail };
