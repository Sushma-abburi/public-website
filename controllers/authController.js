const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

<<<<<<< HEAD
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
=======
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
>>>>>>> 73fd16dc1a1fa34b28b741b0ce0f0be9be07eca0
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

<<<<<<< HEAD
    res.json({ msg: "Login successful", token, user });

  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
=======
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
>>>>>>> 73fd16dc1a1fa34b28b741b0ce0f0be9be07eca0
};
