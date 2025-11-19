// const Login = require("../models/Login");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// // Generate unique ID helper
// const generateUniqueId = async () => {
//   const count = await Login.countDocuments();
//   const next = (count + 1).toString().padStart(4, "0");
//   return `DTVB-${next}`; 
// };

// // -----------------------------------------------------------------
// // REGISTER USER
// // -----------------------------------------------------------------
// exports.registerUser = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       dateOfBirth,
//       email,
//       phoneNumber,
//       password,
//       confirmPassword
//     } = req.body;

//     if (password !== confirmPassword) {
//       return res.status(400).json({ msg: "Passwords do not match" });
//     }

//     // Check for email or phone already registered
//     const existing = await Login.findOne({
//       $or: [{ email }, { phoneNumber }]
//     });

//     if (existing) {
//       return res.status(400).json({ msg: "Email or Phone already registered" });
//     }

//     // Encrypt password
//     const hashed = await bcrypt.hash(password, 10);

//     // Generate unique user ID
//     const uniqueId = await generateUniqueId();

//     const newUser = new Login({
//       uniqueId,
//       firstName,
//       lastName,
//       dateOfBirth,
//       email,
//       phoneNumber,
//       password: hashed
//     });

//     await newUser.save();

//     res.status(201).json({
//       msg: "Registration successful",
//       uniqueId: newUser.uniqueId
//     });

//   } catch (error) {
//     console.error("Registration Error ", error);
//     res.status(500).json({ msg: "Internal Server Error" });
//   }
// };

// // -----------------------------------------------------------------
// // LOGIN USER (email OR phone OR loginId)
// // -----------------------------------------------------------------
// exports.loginUser = async (req, res) => {
//   try {
//     let { loginId, email, phone, password } = req.body;

//     // 🔥 Fix frontend wrong payload:
//     // If frontend sends email as phone OR phone as email, fix it.
//     if (!loginId) {
//       if (email) loginId = email;   // phone entered by user
//       if (phone) loginId = phone;   // email entered by user
//     }

//     if (!loginId || !password) {
//       return res.status(400).json({ msg: "Enter email/phone and password" });
//     }

//     // Find user by email or phone
//     const user = await Login.findOne({
//       $or: [{ email: loginId }, { phoneNumber: loginId }]
//     });

//     if (!user) {
//       return res.status(400).json({ msg: "Invalid login credentials" });
//     }

//     // Compare passwords
//     const validPass = await bcrypt.compare(password, user.password);
//     if (!validPass) {
//       return res.status(400).json({ msg: "Invalid login credentials" });
//     }

//     // Create JWT token
//     const token = jwt.sign(
//       {
//         id: user._id,
//         uniqueId: user.uniqueId,
//         email: user.email
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.status(200).json({
//       msg: "Login successful",
//       token,
//       user: {
//         uniqueId: user.uniqueId,
//         name: `${user.firstName} ${user.lastName}`,
//         email: user.email,
//         phone: user.phoneNumber
//       }
//     });

//   } catch (error) {
//     console.error("Login Error ", error);
//     res.status(500).json({ msg: "Internal Server Error" });
//   }
// };

// // -----------------------------------------------------------------
// // ADMIN GET USER BY UNIQUE ID
// // -----------------------------------------------------------------
// exports.getUserByUniqueId = async (req, res) => {
//   try {
//     const { uniqueId } = req.params;

//     const user = await Login.findOne({ uniqueId });

//     if (!user) {
//       return res.status(404).json({ msg: "User not found" });
//     }

//     res.status(200).json({
//       msg: "User found",
//       user
//     });

//   } catch (error) {
//     console.error("Admin Fetch Error ", error);
//     res.status(500).json({ msg: "Internal Server Error" });
//   }
// };
const User = require("../models/Login");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate unique ID → DTVB-0001 format
const generateUniqueId = async () => {
  const count = await User.countDocuments();
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

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    // Check duplicate email or phone
    const existing = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existing) {
      return res.status(400).json({ msg: "Email or Phone already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uniqueId = await generateUniqueId();

    const newUser = new User({
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
    console.error("Registration Error", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// -------------------------------------------------------
// LOGIN USER (email OR phone)
// -------------------------------------------------------
exports.loginUser = async (req, res) => {
  try {
    let { loginId, email, phone, password } = req.body;

    // convert frontend payload (supports email or phone)
    if (!loginId) {
      if (email) loginId = email;  // phone entered in frontend
      if (phone) loginId = phone;  // email entered in frontend
    }

    if (!loginId || !password) {
      return res.status(400).json({ msg: "Enter email/phone and password" });
    }

    // Search by email or phone (phone ONLY)
    const user = await User.findOne({
      $or: [{ email: loginId }, { phone: loginId }]
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid login credentials" });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({ msg: "Invalid login credentials" });
    }

    const token = jwt.sign(
      { id: user._id, uniqueId: user.uniqueId },
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
    console.error("Login Error", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

exports.getUserByUniqueId = async (req, res) => {
  try {
    const { uniqueId } = req.params;

    const user = await User.findOne({ uniqueId });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({
      msg: "User found",
      user
    });

  } catch (error) {
    console.error("Admin Fetch Error", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};