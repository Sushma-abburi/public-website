const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

module.exports = async function sendSMS(number, message) {
  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: "+91" + number,
    });

    console.log("✅ SMS SENT:", response.sid);
    return true;

  } catch (error) {
    console.error("❌ TWILIO ERROR FULL:", error);
    console.error("❌ ERROR MESSAGE:", error.message);
    console.error("❌ ERROR CODE:", error.code);
    return false;
  }
};

