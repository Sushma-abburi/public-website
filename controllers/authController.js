const Login = require("../models/Login");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate unique ID → DTVB-0001
const generateUniqueId = async () => {
  const count = await Login.countDocuments();
  return `DTVB-${(count + 1).toString().padStart(4, "0")}`;
};

// -------------------------------------------------------
// REGISTER USER
// -------------------------------------------------------
exports.registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dob,
      email,
      countryCode,
      phone,
      password,
      confirmPassword
    } = req.body;

    // 1. Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    // 2. Check email or phone duplicates
    const existing = await Login.findOne({
      $or: [{ email }, { phone }]
    });

    if (existing) {
      return res.status(400).json({ msg: "Email or Phone already registered" });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Generate unique employee ID
    const uniqueId = await generateUniqueId();

    // 5. Create new user
    const newUser = new Login({
      uniqueId,
      firstName,
      lastName,
      dob,
      email,
      countryCode,
      phone,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      msg: "Registration successful",
      uniqueId: newUser.uniqueId
    });

  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// -------------------------------------------------------
// LOGIN USER (email OR phone)
// -------------------------------------------------------
exports.loginUser = async (req, res) => {
  try {
    let { loginId, email, phone, password } = req.body;

    // Accept any of these: loginId / email / phone
    if (!loginId) {
      if (email) loginId = email;
      if (phone) loginId = phone;
    }

    if (!loginId || !password) {
      return res.status(400).json({ msg: "Enter email/phone and password" });
    }

    // Find the user by email OR phone
    const user = await Login.findOne({
      $or: [
        { email: loginId },
        { phone: loginId }
      ]
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid login credentials" });
    }

    // Compare password
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({ msg: "Invalid login credentials" });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        uniqueId: user.uniqueId
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      msg: "Login successful",
      token,
      user: {
        uniqueId: user.uniqueId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// -------------------------------------------------------
// ADMIN — GET USER BY UNIQUE ID (DTVB-0001)
// -------------------------------------------------------
exports.getUserByUniqueId = async (req, res) => {
  try {
    const { uniqueId } = req.params;

    const user = await Login.findOne({ uniqueId });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({
      msg: "User found",
      user
    });

  } catch (error) {
    console.error("Admin Fetch Error:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
