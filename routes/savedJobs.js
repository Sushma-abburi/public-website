const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/savedJobController");

// ✅ Get saved jobs for logged-in user
router.get("/by-user", ctrl.getSavedJobsByUser);

// ✅ Delete saved job
router.delete("/:id", ctrl.deleteSavedJob);

module.exports = router;
