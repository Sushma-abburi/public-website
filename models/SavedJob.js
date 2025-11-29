const mongoose = require("mongoose");

const SavedJobSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    jobTitle: String,
    jobType: String,
    category: String,

    userEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SavedJob", SavedJobSchema);
