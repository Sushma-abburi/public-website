const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
<<<<<<< HEAD
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: Date, required: true },

    email: { type: String, unique: true, sparse: true }, // optional but unique
    countryCode: { type: String, required: true },
    phone: { type: String, unique: true, sparse: true }, // optional but unique
=======
    userId: { type: String, unique: true },

    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    dob: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    phone: { type: String, required: true, unique: true },
>>>>>>> 73fd16dc1a1fa34b28b741b0ce0f0be9be07eca0

    password: { type: String, required: true },
  },
  { timestamps: true }
);

<<<<<<< HEAD
=======
// Auto-generate user ID
userSchema.pre("save", async function (next) {
  if (!this.userId) {
    const lastUser = await mongoose
      .model("User")
      .findOne()
      .sort({ createdAt: -1 });

    let newId = "DTV1001";

    if (lastUser && lastUser.userId) {
      const lastNum = parseInt(lastUser.userId.replace("DTV", ""));
      newId = "DTV" + (lastNum + 1);
    }
    this.userId = newId;
  }

  next();
});

>>>>>>> 73fd16dc1a1fa34b28b741b0ce0f0be9be07eca0
module.exports = mongoose.model("User", userSchema);
