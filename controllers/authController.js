const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ---------------- REGISTER ----------------
exports.register = async (req, res) => {
  try {
    const { firstname, lastname, dob, email, phone, password } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(400).json({ message: "Email already registered" });

    const phoneExists = await User.findOne({ phone });
    if (phoneExists)
      return res.status(400).json({ message: "Phone already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstname,
      lastname,
      dob,
      email,
      phone,
      password: hashed,
    });

    res.status(201).json({
      message: "Registration successful",
      userId: newUser.userId,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- LOGIN ----------------
exports.login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: loginId }, { phone: loginId }],
    });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- GET ALL USERS ----------------
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

// ---------------- GET USER BY userId ----------------
exports.getUserById = async (req, res) => {
  const user = await User.findOne({ userId: req.params.userId }).select(
    "-password"
  );

  if (!user) return res.status(404).json({ message: "Not found" });

  res.json(user);
};

// ---------------- SEARCH USER BY EMAIL/PHONE ----------------
exports.searchUser = async (req, res) => {
  const user = await User.findOne({
    $or: [{ email: req.params.loginId }, { phone: req.params.loginId }],
  }).select("-password");

  if (!user) return res.status(404).json({ message: "Not found" });

  res.json(user);
};
