const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadResume");
const ctrl = require("../controllers/applicationController");


router.post("/", upload.any(), ctrl.createApplication);

// ===============================
// ✅ CREATE / UPDATE / DELETE
// ===============================
// router.post("/", uploadFields, ctrl.createApplication);
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

// routes/applicationRoutes.js   yearly api
router.get("/stats/yearly", ctrl.getYearlyStats);

// ===============================
// ✅ HR / PUBLIC
// ===============================
router.get("/hr", ctrl.getApplicationsForHR);
router.get("/public", ctrl.getPublicApplications);

// ===============================
// ✅ ON-HOLD (SHORTLISTED)
// ===============================
router.get("/hold", ctrl.getOnHoldApplications);

router.get("/rejected", ctrl.getRejectedApplications);


// ===============================
// ✅ SINGLE APPLICATION (MUST BE LAST)
// ===============================
router.get("/:id", ctrl.getApplicationById);

module.exports = router;
