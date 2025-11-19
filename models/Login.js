// const mongoose = require("mongoose");

// const LoginSchema = new mongoose.Schema(
//   {
//     uniqueId: { type: String, unique: true },

//     firstName: String,
//     lastName: String,
//     dateOfBirth: String,
//     email: { type: String, required: true, unique: true },
//     phoneNumber: { type: String, required: true, unique: true },
//     password: { type: String, required: true }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Login", LoginSchema);


const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dob: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    countryCode: { type: String, default: "+91" },

    phone: {
      type: String,
      required: true,
      unique: true
    },

    password: { type: String, required: true },

    uniqueId: { type: String, unique: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Login", UserSchema);
