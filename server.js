const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");


const app = express();
app.use(express.json());
app.use(cors());

app.use(cors({
  origin: "http://localhost:3000", // your React app
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// app.use(async (req, res, next) => {
//   try {
//     await connectDB();
//     next();
//   } catch (err) {
//     return res.status(500).json({ message: "DB connection failed", error: err.message });
//   }
// });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected "))
  .catch((err) => console.error("MongoDB Error ", err));

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

