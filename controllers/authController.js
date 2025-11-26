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

// --------------------------------------------
// LOGIN using email OR phone + password
// --------------------------------------------
exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    console.log("REQUEST BODY:", req.body);

    if (!email && !phone) {
      return res.status(400).json({ msg: "Email or phone is required" });
    }

    let user;

    if (email) {
      user = await User.findOne({ email: email.trim().toLowerCase() });
    }

    if (!user && phone) {
      user = await User.findOne({ phone: phone.trim() });
    }

    console.log("FOUND USER:", user);

    if (!user) {
      return res.status(404).json({ msg: "Invalid email/phone" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ msg: "Login successful", token, user });

  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

////SEND OTP
exports.sendOtp = async (req, res) => {
  try {
    const { emailOrMobile } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { phone: emailOrMobile }],
    });

    if (!user)
      return res.status(404).json({ message: "No user found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    // Send Email or SMS
    if (user.email === emailOrMobile) {
      await sendEmail(user.email, "Your OTP Code", `Your OTP is ${otp}`);
    } else {
      await sendSMS(user.phone, `Your OTP is ${otp}`);
    }

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
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
