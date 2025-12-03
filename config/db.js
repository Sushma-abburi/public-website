// const mongoose = require("mongoose");

// mongoose.set("bufferTimeoutMS", 20000);
// mongoose.set("strictQuery", false);
// mongoose.set("autoIndex", true);

// let isConnected = false;

// const connectDB = async () => {
//   if (isConnected) {
//     return;
//   }

//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 15000,
//     });

//     isConnected = true;
//     console.log("✅ MongoDB Connected:", conn.connection.host);
//   } catch (error) {
//     console.error("❌ MongoDB Connection Failed:", error.message);
//     throw error;
//   }
// };

// module.exports = connectDB;

const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
mongoose.set("autoIndex", true);
mongoose.set("bufferCommands", false); // ✅ prevent query buffering bugs

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // ✅ fail fast
    });

    isConnected = true;
    console.log("✅ MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    throw error; // ✅ REQUIRED so server does not start
  }
};

module.exports = connectDB;
