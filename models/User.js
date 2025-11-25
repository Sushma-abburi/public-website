const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: Date, required: true },

    email: { type: String, unique: true, sparse: true }, // optional but unique
    countryCode: { type: String, required: true },
    phone: { type: String, unique: true, sparse: true }, // optional but unique

    password: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
