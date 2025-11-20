const Candidate = require("../models/Candidate");
const uploadToAzure = require("../utils/uploadToAzure");
const jwt = require("jsonwebtoken");

exports.createCandidate = async (req, res) => {
  try {
    const data = req.body;

    // Generate Email Token (Valid for 1 hour)
    const emailToken = jwt.sign(
      { email: data.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    // Attach token to data before saving
    data.emailToken = emailToken;

    // Upload resume to Azure Blob
    if (req.file) {
      const url = await uploadToAzure(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      data.resume = url;
    }

    const candidate = await Candidate.create(data);

    // Verification link to frontend
    const verificationLink = `https://your-frontend.com/candidate/verify?token=${emailToken}`;

    res.status(201).json({
      message: "Candidate created",
      candidate,
      emailVerificationLink: verificationLink,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    res.status(200).json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateCandidate = async (req, res) => {
  try {
    const data = req.body;

    // If email changed → generate new token
    if (data.email) {
      data.emailToken = jwt.sign(
        { email: data.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
    }

    // Upload new resume if provided
    if (req.file) {
      const url = await uploadToAzure(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      data.resume = url;
    }

    const updated = await Candidate.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Candidate not found" });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.deleteCandidate = async (req, res) => {
  try {
    const deleted = await Candidate.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Candidate not found" });

    res.status(200).json({ message: "Candidate deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getCandidateByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const candidate = await Candidate.findOne({ email });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json(candidate);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
