const mongoose = require("mongoose");

const LoginSchema = new mongoose.Schema(
  {
    uniqueId: { type: String, unique: true },

    firstName: String,
    lastName: String,
    dateOfBirth: String,
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Login", LoginSchema);


