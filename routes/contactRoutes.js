const express = require("express");
const router = express.Router();

const {
  submitContactForm,
  getAllContacts,
} = require("../controllers/contactController");

// ✅ POST contact form
router.post("/", submitContactForm);

// ✅ GET contacts (admin)
router.get("/", getAllContacts);

module.exports = router;
