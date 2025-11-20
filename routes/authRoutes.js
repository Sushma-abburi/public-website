// const express = require("express");
// const router = express.Router();

// const validateRequest = require("../middleware/validateRequest");
// const { registerUser, loginUser, getUserByUniqueId } = require("../controllers/authController");

// // Register
// router.post("/register", validateRequest, registerUser);

// // Login (email or phone)
// router.post("/login", loginUser);

// // Admin search user by unique Id
// router.get("/user/:uniqueId", getUserByUniqueId);

// module.exports = router;
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getAllUsers,
  getUserById,
  searchUser,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

router.get("/users", getAllUsers);
router.get("/user/:userId", getUserById);
router.get("/search/:loginId", searchUser);

module.exports = router;

