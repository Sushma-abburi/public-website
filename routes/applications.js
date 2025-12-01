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
router.patch("/:id", uploadFields, ctrl.patchApplication);
router.delete("/:id", ctrl.deleteApplication);

// ===============================
// ✅ USER ROUTES
// ===============================
router.get("/by-email", ctrl.getApplicationsByEmail);
router.get("/applied-job-ids", ctrl.getAppliedJobIdsByEmail);

// ===============================
// ✅ ADMIN STATS (MUST BE ABOVE :id)
// ===============================
router.get("/stats/summary", ctrl.getSummaryStats);
router.get("/stats/monthly", ctrl.getMonthlyStats);

// ===============================
// ✅ HR / PUBLIC
// ===============================
router.get("/hr", ctrl.getApplicationsForHR);
router.get("/public", ctrl.getPublicApplications);

// ===============================
// ✅ SINGLE APPLICATION (MUST BE LAST)
// ===============================
router.get("/:id", ctrl.getApplicationById);

//onhold
router.get("/hold", ctrl.getOnHoldApplications);


module.exports = router;
