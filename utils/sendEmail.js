const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      text,
    });

    return true;
  } catch (error) {
    console.log("Email Error:", error);
    return false;
  }
};

module.exports = sendEmail;
