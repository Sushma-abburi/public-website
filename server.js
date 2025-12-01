const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const applicationRoutes = require("./routes/applications");
const savedJobRoutes = require("./routes/savedJobs");

const app = express();
app.use(express.json());
//app.use(cors());

// app.use(cors({
//   origin: "http://localhost:3000", // your React app
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));
app.use(cors({
  origin: "*",   // ✅ allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/saved-jobs", savedJobRoutes);

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected "))
  .catch((err) => console.error("MongoDB Error ", err));

app.post('/api/applications', (req, res) => {
  console.log('TEST-APP: POST /api/applications received, body:', req.body);
  res.json({ ok: true, msg: 'TEST handler responded' });
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

