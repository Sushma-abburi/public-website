const mongoose = require("mongoose");
mongoose.set("bufferCommands", false);

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
   // ✅ ✅ ✅ THIS WAS MISSING
    isProfileCompleted: {
      type: Boolean,
      default: false
    },
 profilePhoto: {
  type: String,
  default: null
}
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
