const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: Date, required: true },

    email: { type: String, unique: true, sparse: true }, // optional but unique
    countryCode: { type: String, required: true },
    phone: {
  type: String,
  required: true,
  match: [/^\d{10}$/, "Phone must be 10 digits"]
}
, // optional but unique

    password: { type: String, required: true },
    otp: String,
    otpExpires: Date,

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
