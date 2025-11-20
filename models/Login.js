const mongoose = require("mongoose");

const LoginSchema = new mongoose.Schema(
  {
    uniqueId: { type: String, unique: true },

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    dob: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    countryCode: { type: String, default: "+91" },

    phone: { type: String, required: true, unique: true },

    password: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Login", LoginSchema);
