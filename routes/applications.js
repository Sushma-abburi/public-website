// // routes/applications.js
// const express = require("express");
// const router = express.Router();
// const upload = require("../middleware/uploadResume"); // multer memory storage
// const ctrl = require("../controllers/applicationController");
 
// const uploadFields = upload.fields([
//   { name: "photo", maxCount: 1 },
//   { name: "resume", maxCount: 1 },
//   { name: "certificates", maxCount: 20 }
// ]);
 
// router.post("/", uploadFields, ctrl.createApplication);
// router.patch("/:id", uploadFields, ctrl.patchApplication);
// router.get("/hr", ctrl.getApplicationsForHR);
// router.get("/public", ctrl.getPublicApplications);
// router.get("/by-email", ctrl.getApplicationsByEmail);
// router.get("/:id", ctrl.getApplicationById);
// router.delete("/:id", ctrl.deleteApplication);
 
// module.exports = router;
const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadResume"); // multer memory storage
const ctrl = require("../controllers/applicationController");

// ✅ Multer Fields
const uploadFields = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "resume", maxCount: 1 },
  { name: "certificates", maxCount: 20 }
]);

// ===============================
// ✅ APPLICATION CRUD ROUTES
// ===============================

// ✅ Create application (with files)
router.post("/", uploadFields, ctrl.createApplication);

// ✅ Update application (with files)
router.patch("/:id", uploadFields, ctrl.patchApplication);

// ✅ Delete application
router.delete("/:id", ctrl.deleteApplication);

// ===============================
// ✅ USER-FACING ROUTES
// ===============================

// ✅ Get applications by user email (My Applied Jobs)
router.get("/by-email", ctrl.getApplicationsByEmail);

// ✅ Get applied job IDs by email (for "Already Applied" badge)
router.get("/applied-job-ids", ctrl.getAppliedJobIdsByEmail);

// ===============================
// ✅ PUBLIC / HR ROUTES
// ===============================

// ✅ HR - Get all applications (with pagination/search if needed later)
router.get("/hr", ctrl.getApplicationsForHR);

// ✅ Public visible applications
router.get("/public", ctrl.getPublicApplications);

// ✅ Get application by ID (single view)
router.get("/:id", ctrl.getApplicationById);

// ===============================
// ✅ ADMIN DASHBOARD STATS
// ===============================

// ✅ Summary cards: totalApplied, onHold, hired
router.get("/stats/summary", ctrl.getSummaryStats);

// ✅ Monthly chart stats
router.get("/stats/monthly", ctrl.getMonthlyStats);

module.exports = router;
