const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadResume");
const authMiddleware = require("../middleware/authMiddleware");
const uploadProfile = require("../middleware/uploadResume").fields([
  { name: "photo", maxCount: 1 },
  { name: "resume", maxCount: 1 }
]);
const {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  getCandidateByEmail,
  prefillApplication,
  getBasicDetailsForApplication,
  getProfilePrefillFromJob,
  updateUserProfile,
  saveUserProfile,
} = require("../controllers/candidateController");

// CREATE
router.post("/save", upload.single("resume"), createCandidate);

// READ
router.get("/", getAllCandidates);

//PREFILL BASIC DETAILS FOR JOB APPLICATION FORM
 router.get("/basic-details",
  authMiddleware,
  getBasicDetailsForApplication
 );

 //PREFILL PROFILE PAGE (JO APPLICAION -> FALLBACK PROFILE )
 router.get(
  "/prefill-profile",
  authMiddleware,
  getProfilePrefillFromJob
 );

 //profile update
 router.post(
  "/update-profile",
  authMiddleware,
  uploadProfile,
  updateUserProfile
 )
//  PREFILL MUST COME BEFORE :id
router.get(
  "/prefill-application",
  authMiddleware,
  prefillApplication
);

// ===============================
// ✅ SAVE PROFILE (DRAFT)
// ===============================
// Used when user clicks "Save" button
router.post(
  "/profile/save",
  authMiddleware,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  saveUserProfile
);

router.get("/email/:email", getCandidateByEmail);

// UPDATE
router.put("/:id", upload.single("resume"), updateCandidate);

// DELETE
router.delete("/:id", deleteCandidate);

// ✅ PARAM ROUTE ALWAYS LAST
router.get("/:id", getCandidateById);

module.exports = router;
