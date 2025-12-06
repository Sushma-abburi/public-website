const Candidate = require("../models/Candidate");
const User = require("../models/User");   // ✅ ADD THIS

const uploadToAzure = require("../utils/uploadToAzure");
const jwt = require("jsonwebtoken");

exports.createCandidate = async (req, res) => {
  try {
    const data = req.body;

    // ✅ FIND USER BY EMAIL
    const user = await User.findOne({ email: data.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Generate Email Token
    const emailToken = jwt.sign(
      { email: data.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    data.emailToken = emailToken;

    // ✅ Upload resume to Azure
    if (req.file) {
      const url = await uploadToAzure(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      data.resume = url;
    }

    // ✅ SAVE CANDIDATE
    const candidate = await Candidate.create(data);

    // ✅ ✅ ✅ MARK PROFILE AS COMPLETED
    user.isProfileCompleted = true;
    await user.save();

    const verificationLink = `https://your-frontend.com/candidate/verify?token=${emailToken}`;

    res.status(201).json({
      message: "Candidate created",
      candidate,
      isProfileCompleted: true,   // ✅ Optional useful response
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

////prefill details
exports.prefillApplication = async (req, res) => {
  try {
    // ✅ Fetch user first
    const user = await User.findById(req.user.id).select("email");

    if (!user || !user.email) {
      return res.json({ prefillAvailable: false });
    }

    // ✅ Normalize email
    const email = user.email.toLowerCase().trim();

    const candidate = await Candidate.findOne({ email });

    if (!candidate) {
      return res.json({ prefillAvailable: false });
    }

    const prefillData = {
      personal: {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone,
        alternativePhone: candidate.alternatePhone
      },
      educations: [
        {
          educationLevel: candidate.course,
          department: candidate.department,
          collegeName: candidate.college
        }
      ],
      professional: {
        jobType: candidate.employeeType,
        companyName: candidate.companyName || "",
        duration: candidate.experienceYears || "",
        skills: candidate.skills || [],
        resumeUrl: candidate.resume || ""
      }
    };

    res.status(200).json({
      prefillAvailable: true,
      data: prefillData
    });

  } catch (err) {
    console.error("Prefill error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
