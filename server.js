const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const applicationRoutes = require("./routes/applications");
const savedJobRoutes = require("./routes/savedJobs");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// ✅ DISABLE MONGOOSE BUFFERING (IMPORTANT)
mongoose.set("bufferCommands", false);
mongoose.set("strictQuery", false);

// ✅ ✅ SERVER BOOTSTRAP FUNCTION (THIS FIXES YOUR ERROR PERMANENTLY)
const startServer = async () => {
  try {
    // ✅ CONNECT TO MONGO FIRST
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB Connected");

    // ✅ LOAD ROUTES ONLY AFTER DB CONNECTS
    app.use("/api/auth", authRoutes);
    app.use("/api/candidates", candidateRoutes);
    app.use("/api/applications", applicationRoutes);
    app.use("/api/saved-jobs", savedJobRoutes);
    app.use("/api/contact", contactRoutes);

    // ✅ TEST ROUTE
    app.post("/api/applications-test", (req, res) => {
      console.log("TEST-APP: body:", req.body);
      res.json({ ok: true, msg: "TEST handler responded" });
    });

    app.get("/", (req, res) => {
      res.send("✅ API is running...");
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`✅ Server running on port ${PORT}`)
    );
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1); // ✅ STOP SERVER IF DB FAILS
  }
};

// ✅ START SERVER
startServer();
