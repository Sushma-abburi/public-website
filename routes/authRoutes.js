const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

<<<<<<< HEAD
router.post("/register", register);
router.post("/login", login);
=======
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
>>>>>>> 73fd16dc1a1fa34b28b741b0ce0f0be9be07eca0

module.exports = router;
