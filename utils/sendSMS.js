const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

module.exports = async function sendSMS(number, message) {
  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE, // Your Twilio phone number
      to: "+91" + number,             // Indian number format
    });

    console.log("SMS SENT →", response.sid);
    return true;

  } catch (error) {
    console.log("Twilio SMS Error:", error);
    return false;
  }
};
