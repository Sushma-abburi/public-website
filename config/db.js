// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("MongoDB connected ✔");
//   } catch (err) {
//     console.error("MongoDB Connection Error ❌", err);
//   }
// };

// module.exports = connectDB;
const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("MongoDB Connection Error:", err.message);
  }
};

module.exports = connectDB;
