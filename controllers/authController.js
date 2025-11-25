const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
console.log("EMAIL TYPE:", typeof email, "VALUE:", email);
console.log("PHONE TYPE:", typeof phone, "VALUE:", phone);

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
