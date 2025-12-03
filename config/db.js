// const mongoose = require("mongoose");

// mongoose.set("strictQuery", false);
// mongoose.set("autoIndex", true);  // enables index creation
// let isConnected = false; // prevent multiple connections

// const connectDB = async () => {
//   if (isConnected) return;

//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI, {
//       serverSelectionTimeoutMS: 5000,
//     });

//     console.log("MongoDB connected");
//     isConnected = true;
//     return conn;
//   } catch (err) {
//     console.error("MongoDB connection error:", err.message);
//     throw err;
//   }
// };

// module.exports = connectDB;


import mongoose from "mongoose";

mongoose.set("bufferTimeoutMS", 20000);
mongoose.set("strictQuery", false);
mongoose.set("autoIndex", true);
let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
    });

    isConnected = true;
    console.log("✅ MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    throw error;
  }
};

