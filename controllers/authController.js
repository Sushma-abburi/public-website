const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");
const uploadToAzure = require("../utils/uploadToAzure");
const generateUniqueId = require("../helpers/generateId");

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, dob, email, countryCode, phone, password, confirmPassword } =
      req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    // check existing user
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ msg: "Email already exists" });

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) return res.status(400).json({ msg: "Phone already exists" });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // ✅ Generate safe unique ID
    const userId = await generateUniqueId();
    

    const newUser = new User({
      userId,
      firstName,
      lastName,
      dob,
      email,
      countryCode,
      phone,
      password: hashed,
    });

    await newUser.save();
    res.status(201).json({ msg: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if ((!email || email.trim() === "") && (!phone || String(phone).trim() === "")) {
      return res.status(400).json({ msg: "Email or phone is required" });
    }

    let user = null;

    // ✅ EMAIL LOGIN
    if (email && email.trim() !== "") {
      user = await User.findOne({ email: email.trim().toLowerCase() });
    }

    // ✅ 10-DIGIT PHONE LOGIN ONLY
    if (!user && phone) {
      const cleanPhone = String(phone).replace(/\D/g, ""); // removes spaces, symbols

      // ✅ STRICT 10 DIGIT CHECK
      if (!/^\d{10}$/.test(cleanPhone)) {
        return res.status(400).json({ msg: "Phone number must be exactly 10 digits" });
      }

      user = await User.findOne({ phone: cleanPhone });
    }

    if (!user) {
      return res.status(404).json({ msg: "Invalid email or phone" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

res.json({
  msg: "Login successful",
  token,
  user: {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    isProfileCompleted: user.isProfileCompleted,
    profilePhoto: user.profilePhoto   // ✅ ADD THIS
  }
});


  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.uploadProfilePhoto = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);  // Debug
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: "Invalid user token" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    console.log("FILE RECEIVED:", req.file);

    const photoUrl = await uploadToAzure(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    if (!photoUrl) {
      return res.status(500).json({ message: "Azure upload failed" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePhoto: photoUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }

    res.json({
      message: "Profile photo updated successfully",
      profilePhoto: user.profilePhoto
    });

  } catch (error) {
    console.log("Upload error:", error);
    res.status(500).json({ message: error.message });
  }
};
////VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    // ✅ CRASH-PROOF BODY READ
    const emailOrMobile = req.body && req.body.emailOrMobile;
    const otp = req.body && req.body.otp;

    console.log("RAW BODY:", req.body);

    if (!emailOrMobile || !otp) {
      return res.status(400).json({
        message: "Email/Mobile and OTP are required"
      });
    }

    let identity = emailOrMobile;

    // normalize indian numbers
    if (/^\+91\d{10}$/.test(identity)) {
      identity = identity.slice(3);
    }

    const user = await User.findOne({
      $or: [{ email: identity }, { phone: identity }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    return res.json({ message: "OTP verified successfully" });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


////RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { emailOrMobile, otp, newPassword } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { phone: emailOrMobile }],
    });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

///send sms

// exports.sendOtp = async (req, res) => {
//   try {
//     const { emailOrMobile } = req.body;

//     const user = await User.findOne({
//       $or: [{ email: emailOrMobile }, { phone: emailOrMobile }],
//     });

//     if (!user)
//       return res.status(404).json({ message: "No user found" });

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     user.otp = otp;
//     user.otpExpires = Date.now() + 5 * 60 * 1000;
//     await user.save();

//     // Priority: email or mobile
//     if (emailOrMobile.includes("@")) {
//       await sendEmail(user.email, "Your OTP", `Your OTP is ${otp}`);
//     } else {
//       await sendSMS(user.phone, `Your OTP is ${otp}`);
//     }

//     res.json({ message: "OTP sent successfully" });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.sendOtp = async (req, res) => {
  try {
    const { emailOrMobile } = req.body;

    if (!emailOrMobile) {
      return res.status(400).json({ message: "Email or Mobile is required" });
    }

    // Detect input type
    const isEmail = /\S+@\S+\.\S+/.test(emailOrMobile);
    const isMobile = /^\d{10}$/.test(emailOrMobile);

    if (!isEmail && !isMobile) {
      return res
        .status(400)
        .json({ message: "Enter valid email or 10-digit mobile number" });
    }

    // Find registered user only
    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { phone: emailOrMobile }],
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found with this email or mobile" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    // ✅ SEND VIA EMAIL
    if (isEmail) {
      const emailSent = await sendEmail({
        to: user.email,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
      });

      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send OTP email" });
      }
    }

    // ✅ SEND VIA SMS
    if (isMobile) {
      const smsSent = await sendSMS(
        user.phone,
        `Your OTP is ${otp}. It will expire in 5 minutes.`
      );

      if (!smsSent) {
        return res.status(500).json({ message: "Failed to send OTP SMS" });
      }
    }

    return res.json({
      message: "OTP sent successfully",
      delivery: isEmail ? "email" : "sms",
    });

  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
