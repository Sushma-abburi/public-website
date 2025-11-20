const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true },

    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    dob: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    phone: { type: String, required: true, unique: true },

    password: { type: String, required: true },
  },
  { timestamps: true }
);

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

module.exports = mongoose.model("User", userSchema);
