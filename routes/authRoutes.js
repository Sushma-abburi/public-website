const express = require("express");
const router = express.Router();

const validateRequest = require("../middleware/validateRequest");
const { registerUser, loginUser, getUserByUniqueId } = require("../controllers/authController");

// Register
router.post("/register", validateRequest, registerUser);

// Login (email or phone)
router.post("/login", loginUser);

// Admin search user by unique Id
router.get("/user/:uniqueId", getUserByUniqueId);

module.exports = router;

