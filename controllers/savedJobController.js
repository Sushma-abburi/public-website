const SavedJob = require("../models/SavedJob");

// ✅ SAVE JOB (THIS IS THE MISSING PIECE)
exports.saveJob = async (req, res) => {
  try {
    const { userEmail, jobId, jobTitle, jobType, category } = req.body;

    if (!userEmail || !jobId) {
      return res.status(400).json({ msg: "userEmail and jobId are required" });
    }

    // ✅ Prevent duplicate save
    const existing = await SavedJob.findOne({
      userEmail,
      jobId
    });

    if (existing) {
      return res.json({ msg: "Job already saved" });
    }

    const savedJob = await SavedJob.create({
      userEmail,
      jobId,        // ✅ MATCHES SCHEMA
      jobTitle,
      jobType,
      category
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

    console.log("✅ Email received:", email);

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const jobs = await SavedJob.find({ userEmail: email });

    console.log("✅ Jobs found:", jobs);

    res.status(200).json({
      savedJobs: jobs
    });

  } catch (error) {
    console.error("❌ Get saved jobs FULL error:", error);  // <-- IMPORTANT
    res.status(500).json({
      message: "Server error",
      error: error.message      // <-- SEND REAL ERROR TO FRONTEND
    });
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
