const express = require("express");
const router = express.Router();
const { register, 
    login, 
    sendOtp,
    verifyOtp,
    resetPassword } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

// Forgot Password APIs
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);


module.exports = router;
