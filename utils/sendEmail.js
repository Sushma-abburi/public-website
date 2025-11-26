// const nodemailer = require("nodemailer");

// const sendEmail = async (to, subject, text) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: process.env.EMAIL,
//       to,
//       subject,
//       text,
//     });

//     console.log("OTP Email Sent →", to);

//     return true;
//   } catch (error) {
//     console.log("Email Sending Error:", error);
//     return false;
//   }
// };

// module.exports = sendEmail;
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {

    if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
      console.log("❌ Missing EMAIL or EMAIL_PASS in .env");
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      }
    });

    const info = await transporter.sendMail({
      from: `"Public Website" <${process.env.EMAIL}>`,
      to,
      subject,
      text,
    });

    console.log("✔ Email sent:", info.messageId);
    return true;

  } catch (error) {
    console.log("❌ Email Sending Error:", error);
    return false;
  }
};

module.exports = sendEmail;
