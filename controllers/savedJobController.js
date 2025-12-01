// const SavedJob = require("../models/SavedJob");

// // ✅ GET SAVED JOBS BY USER EMAIL
// exports.getSavedJobsByUser = async (req, res) => {
//   try {
//     const { email } = req.query;

//     if (!email) {
//       return res.status(400).json({ msg: "Email is required" });
//     }

//     const jobs = await SavedJob.find({ userEmail: email }).sort({
//       createdAt: -1,
//     });

//     res.json({
//       success: true,
//       data: jobs,
//     });
//   } catch (err) {
//     res.status(500).json({ msg: err.message });
//   }
// };

// // ✅ DELETE SAVED JOB
// exports.deleteSavedJob = async (req, res) => {
//   try {
//     const { id } = req.params;

//     await SavedJob.findByIdAndDelete(id);

//     res.json({
//       success: true,
//       msg: "Saved job deleted",
//     });
//   } catch (err) {
//     res.status(500).json({ msg: err.message });
//   }
// };
const SavedJob = require("../models/SavedJob");

// ✅ GET SAVED JOBS BY USER EMAIL
exports.getSavedJobsByUser = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const jobs = await SavedJob.find({ userEmail: email })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      savedJobs: jobs   // ✅ FIXED KEY FOR FRONTEND
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
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
