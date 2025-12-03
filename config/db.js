const mongoose = require("mongoose");

mongoose.set("bufferTimeoutMS", 20000);
mongoose.set("strictQuery", false);
mongoose.set("autoIndex", true);

let isConnected = false;

const connectDB = async () => {
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

module.exports = connectDB;
