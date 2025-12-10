const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadResume");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  getCandidateByEmail,
  prefillApplication,
  saveOrUpdateProfile
} = require("../controllers/candidateController");

// CREATE
router.post("/save", upload.single("resume"), createCandidate);

// READ
router.get("/", getAllCandidates);

// ✅ PREFILL MUST COME BEFORE :id
router.get(
  "/prefill-application",
  authMiddleware,
  prefillApplication
);

// router.post(
//   "/profile",
//   authMiddleware,
//   upload.fields([
//     { name: "resume", maxCount: 1 },
//     { name: "photo", maxCount: 1 },
//   ]),
//   saveOrUpdateProfile
// );

router.get("/email/:email", getCandidateByEmail);

// UPDATE
router.put("/:id", upload.single("resume"), updateCandidate);

// DELETE
router.delete("/:id", deleteCandidate);

// ✅ PARAM ROUTE ALWAYS LAST
router.get("/:id", getCandidateById);

module.exports = router;
