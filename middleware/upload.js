const multer = require("multer");

const storage = multer.memoryStorage(); // ✅ Needed for Azure upload

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;
