// middleware/uploadResume.js
const multer = require("multer");

const storage = multer.memoryStorage(); // 👈 Buffer stored in RAM

const upload = multer({ storage });

module.exports = upload;
