const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadResume"); // your multer memory storage
const ctrl = require("../controllers/applicationController");
 
// Accept fields:
// - photo : single
// - resume: single
// - certificates: multiple (n)
const uploadFields = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "resume", maxCount: 1 },
  { name: "certificates", maxCount: 20 }
]);
 
router.post("/", uploadFields, ctrl.createApplication);
router.patch("/:id", uploadFields, ctrl.patchApplication);
router.get("/hr", ctrl.getApplicationsForHR);
router.get("/public", ctrl.getPublicApplications);
router.get("/by-email", ctrl.getApplicationsByEmail);
router.get("/:id", ctrl.getApplicationById);
router.delete("/:id", ctrl.deleteApplication);
 
module.exports = router;