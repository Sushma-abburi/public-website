const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadResume");
const {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
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

module.exports = router;
