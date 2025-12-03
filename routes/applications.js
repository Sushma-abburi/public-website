const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadResume");
const ctrl = require("../controllers/applicationController");

const uploadFields = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "resume", maxCount: 1 },
  { name: "certificates", maxCount: 20 }
]);

// ===============================
// ✅ CREATE / UPDATE / DELETE
// ===============================
router.post("/", uploadFields, ctrl.createApplication);

// ✅ HR STATUS + REASON UPDATE (THIS ONE UPDATES DB)
router.patch("/:id", ctrl.patchApplication);

router.delete("/:id", ctrl.deleteApplication);

// ===============================
// ✅ USER ROUTES
// ===============================
router.get("/by-email", ctrl.getApplicationsByEmail);
router.get("/applied-job-ids", ctrl.getAppliedJobIdsByEmail);

// ===============================
// ✅ ADMIN STATS
// ===============================
router.get("/stats/summary", ctrl.getSummaryStats);
router.get("/stats/monthly", ctrl.getMonthlyStats);
router.get("/stats/by-month", ctrl.getApplicationsByMonth);
router.get("/hired", ctrl.getHiredApplications);

// ===============================
// ✅ HR / PUBLIC
// ===============================
router.get("/hr", ctrl.getApplicationsForHR);
router.get("/public", ctrl.getPublicApplications);

// ===============================
// ✅ ON-HOLD (SHORTLISTED)
// ===============================
router.get("/hold", ctrl.getOnHoldApplications);

// ===============================
// ✅ SINGLE APPLICATION (MUST BE LAST)
// ===============================
router.get("/:id", ctrl.getApplicationById);

module.exports = router;
