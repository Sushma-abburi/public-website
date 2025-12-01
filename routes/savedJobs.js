const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/savedJobController");

router.post("/", ctrl.saveJob);                // ✅ SAVE
router.get("/by-user", ctrl.getSavedJobsByUser); // ✅ GET
router.delete("/:id", ctrl.deleteSavedJob);     // ✅ DELETE

module.exports = router;
