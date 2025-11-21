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

