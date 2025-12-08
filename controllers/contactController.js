const Contact = require("../models/Contact");
const sendEmail = require("../utils/sendEmail");

exports.submitContactForm = async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Admin email
    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: "📩 New Contact Form Submission",
        html: `
          <p><b>Name:</b> ${firstName} ${lastName}</p>
          <p><b>Email:</b> ${email}</p>
          <p>${message}</p>
        `,
      });
    } else {
      console.error("ADMIN_EMAIL is missing in .env");
    }

     // ✅ User auto-reply
    await sendEmail({
      to: email,
      subject: "✅ We received your message",
      html: `
        <p>Hi ${firstName},</p>
        <p>Thanks for contacting <b>DhaTvi Business Solutions</b>.</p>
        <p>Our team will get back to you shortly.</p>
        <br/>
        <p>Regards,<br/>DhaTvi Team</p>
      `,
    });

    res.status(201).json({ message: "Contact form submitted successfully" });
  } catch (error) {
    console.error("Contact Email Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET: Admin can view contacts
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};