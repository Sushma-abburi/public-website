const express = require("express");
const authMiddleware = require("../middleware/authMiddleware"); 
const upload = require("../middleware/upload");  // ✅ ADD THIS
const authController = require("../controllers/authController"); 


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
router.post(
  "/upload-profile-photo",
  authMiddleware,           // ✅ CORRECT
  upload.single("photo"),
  authController.uploadProfilePhoto
);



module.exports = router;
