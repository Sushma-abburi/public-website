const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");


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

    const newUser = new User({
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

    // res.json({ msg: "Login successful", token, user });
    res.json({
  msg: "Login successful",
  token,
  user: {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    isProfileCompleted: user.isProfileCompleted
  }
});


  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

////VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { emailOrMobile, otp } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { phone: emailOrMobile }],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    res.json({ message: "OTP verified successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
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

    // Detect whether user entered email or phone number
    const isEmail = /\S+@\S+\.\S+/.test(emailOrMobile);
    const isMobile = /^[0-9]{10}$/.test(emailOrMobile);

    if (!isEmail && !isMobile) {
      return res.status(400).json({ message: "Enter valid email or 10-digit mobile number" });
    }

    // Fetch user by either email or phone
    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { phone: emailOrMobile }],
    });

    if (!user) {
      return res.status(404).json({ message: "No user found with this email or mobile" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    // --- Send OTP via EMAIL ---
    if (isEmail) {
      const emailSent = await sendEmail(
        user.email,
        "Your OTP Code",
        `Your OTP is ${otp}\nIt will expire in 5 minutes.`
      );

      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send OTP email" });
      }
    }

    // --- Send OTP via SMS ---
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
    console.log("SEND OTP ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
