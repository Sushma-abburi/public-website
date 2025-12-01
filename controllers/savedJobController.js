const SavedJob = require("../models/SavedJob");

// ✅ SAVE JOB (THIS IS THE MISSING PIECE)
exports.saveJob = async (req, res) => {
  try {
    const { userEmail, jobId, jobTitle, jobType } = req.body;

    // ✅ Validation
    if (!userEmail || !jobId) {
      return res.status(400).json({ msg: "userEmail and jobId are required" });
    }

    // ✅ Prevent duplicate saved jobs
    const existing = await SavedJob.findOne({
      userEmail,
      originalJobId: jobId
    });

    if (existing) {
      return res.json({ msg: "Job already saved" });
    }

    const savedJob = await SavedJob.create({
      userEmail,                     // ✅ REQUIRED
      originalJobId: jobId,          // ✅ REQUIRED
      jobTitle,                      // ✅ REQUIRED for frontend
      jobType,                       // ✅ REQUIRED for frontend
    });

    res.status(201).json({
      success: true,
      msg: "Job saved successfully",
      savedJob
    });

  } catch (err) {
    console.error("Save job error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};


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
