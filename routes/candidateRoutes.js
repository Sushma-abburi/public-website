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
} = require("../controllers/candidateController");

// CREATE
router.post("/save", upload.single("resume"), createCandidate);

// READ
router.get("/", getAllCandidates);
router.get("/:id", getCandidateById);

// UPDATE
router.put("/:id", upload.single("resume"), updateCandidate);

// DELETE
router.delete("/:id", deleteCandidate);
router.get("/email/:email", getCandidateByEmail);

// ✅ Prefill Application Form
router.get(
  "/prefill-application",
  authMiddleware,
  prefillApplication
);

module.exports = router;
