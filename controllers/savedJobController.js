const SavedJob = require("../models/SavedJob");

// ✅ GET SAVED JOBS BY USER EMAIL
exports.getSavedJobsByUser = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const jobs = await SavedJob.find({ userEmail: email })
      .sort({ createdAt: -1 });

    res.status(200).json({
      savedJobs: jobs   // ✅ IMPORTANT KEY NAME
    });

  } catch (error) {
    console.error("Get saved jobs error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ DELETE SAVED JOB
exports.deleteSavedJob = async (req, res) => {
  try {
    const { id } = req.params;

    await SavedJob.findByIdAndDelete(id);

    res.json({
      success: true,
      msg: "Saved job deleted"
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
