const mongoose = require("mongoose");

const profileDraftSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ONE draft per user
    },

    profile: {
      personal: Object,
      educations: Array,
      professional: Object,
    },

    photo: String,
    resume: String,

    lastSavedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProfileDraft", profileDraftSchema);
