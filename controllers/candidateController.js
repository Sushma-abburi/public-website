const Candidate = require("../models/Candidate");
const User = require("../models/User");   // ✅ ADD THIS.
const Application = require("../models/Application"); //ADD THIS..
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

    // // ✅ ✅ ✅ MARK PROFILE AS COMPLETED
    // user.isProfileCompleted = true;
    // await user.save();

    // ✅ MARK PROFILE AS COMPLETED + UPDATE NAME
    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.isProfileCompleted = true;
    await user.save();


    const verificationLink = `https://your-frontend.com/candidate/verify?token=${emailToken}`;

    res.status(201).json({
      message: "Candidate created",
      candidate,
      user: {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
   },
      isProfileCompleted: true,   // ✅ Optional useful response
      emailVerificationLink: verificationLink,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET ALL CANDIDATES
exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET CANDIDATE BY ID
exports.getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    res.status(200).json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//UPDATE CANDIDATE
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


//DELETE CANDIDATE
exports.deleteCandidate = async (req, res) => {
  try {
    const deleted = await Candidate.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Candidate not found" });

    res.status(200).json({ message: "Candidate deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET CANDIDATE BY EMAIL
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

//OLD PREFILL FROM CANDIDATE PROFILE (USED IN JOB FORM)
exports.prefillApplication = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("email");
    if (!user?.email) return res.json({ prefillAvailable: false });

    const email = user.email.toLowerCase().trim();
    const candidate = await Candidate.findOne({ email });

    if (!candidate) return res.json({ prefillAvailable: false });

    const prefillData = {
      personal: {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone,
        alternatePhone: candidate.alternatePhone,
      },
      educations: candidate.educations?.length
        ? candidate.educations
        : [
            {
              course: candidate.course || "",
              department: candidate.department || "",
              collegeName: candidate.college || "",
              yearOfPassing: "",
            },
          ],
      professional: {
        jobType: candidate.employeeType || "",
        currentCompany: candidate.companyName || "",
        designation: "",
        skills: candidate.professional?.skills?.length
          ? candidate.professional.skills
          : candidate.skills || [],
        certifications: candidate.professional?.certifications || [],
        projects: candidate.professional?.projects || [],
        experiences: candidate.professional?.experiences || [],
        salary: candidate.professional?.salary || "",
        resume: candidate.professional?.resume || candidate.resume || "",
      },
    };

    res.status(200).json({
      prefillAvailable: true,
      data: prefillData,
    });
  } catch (err) {
    console.error("Prefill error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   NEW FUNCTION 1:
   PREFILL BASIC DETAILS FOR JOB APPLICATION FORM
   (from Candidate Profile ONLY)
========================================================= */
exports.getBasicDetailsForApplication = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("email");
    if (!user) return res.json({ success: true, data: null });

    const candidate = await Candidate.findOne({ email: user.email });

    if (!candidate) {
      return res.json({ success: true, data: null });
    }

    res.json({
      success: true,
      data: {
        personal: candidate.personal || {},
        educations: candidate.educations || [],
        professional: {
          jobType: candidate.professional?.jobType || "",
          skills: candidate.professional?.skills || [],
        }
      }
    });

  } catch (err) {
    console.error("Basic Details Prefill Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


/* =========================================================
   NEW FUNCTION 2:
   PREFILL PROFILE PAGE FROM JOB APPLICATION (fallback to candidate)
========================================================= */
exports.getProfilePrefillFromJob = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("email");
    if (!user?.email) return res.json({ prefillAvailable: false });

    const email = user.email.toLowerCase().trim();

    // Find latest job application by email (NOT userId)
    const lastApp = await Application
      .findOne({ "personal.email": email })
      .sort({ createdAt: -1 });

    const candidate = await Candidate.findOne({ email });

    if (!lastApp && !candidate) {
      return res.json({ prefillAvailable: false, data: {} });
    }

    const result = {
      personal: {
        firstName: lastApp?.personal?.firstName || candidate?.personal?.firstName || "",
        lastName: lastApp?.personal?.lastName || candidate?.personal?.lastName || "",
        email,
        phone: lastApp?.personal?.phone || candidate?.personal?.phone || "",
        currentAddress:
          lastApp?.personal?.currentAddress ||
          candidate?.personal?.currentAddress ||
          "",
      },

      educations: lastApp?.educations?.length
        ? lastApp.educations
        : candidate?.educations || [],

      professional: {
        jobType: lastApp?.professional?.jobType || candidate?.professional?.jobType || "",
        skills: lastApp?.professional?.skills?.length
          ? lastApp.professional.skills
          : candidate?.professional?.skills || [],
        certifications: lastApp?.professional?.certifications || candidate?.professional?.certifications || [],
        projects: lastApp?.professional?.projects || candidate?.professional?.projects || [],
        experiences: lastApp?.professional?.experiences || candidate?.professional?.experiences || [],
        linkedin: lastApp?.professional?.linkedin || candidate?.professional?.linkedin || "",
        achievements: lastApp?.professional?.achievements || candidate?.professional?.achievements || "",
        salary: lastApp?.professional?.salary || candidate?.professional?.salary || "",
        resume: lastApp?.professional?.resumeUrl || candidate?.professional?.resume || null,
      }
    };

    res.json({ prefillAvailable: true, data: result });

  } catch (err) {
    console.error("Profile Prefill Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
//update profile user
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const parsedProfile = JSON.parse(req.body.profile || "{}");

    let candidate = await Candidate.findOne({ userId });

    if (!candidate) {
      candidate = new Candidate({ userId });
    }

    // MERGE PERSONAL
    candidate.personal = {
      ...candidate.personal,
      ...parsedProfile.personal,
    };

    // FIX: ensure top-level email exists (prevents validation error)
    candidate.email = parsedProfile.personal?.email || candidate.email;

    // MERGE EDUCATIONS
    candidate.educations = parsedProfile.educations || candidate.educations;

    // MERGE PROFESSIONAL
    candidate.professional = {
      ...candidate.professional,
      ...parsedProfile.professional,
    };

    // PHOTO UPLOAD
    if (req.files?.photo?.[0]) {
      const url = await uploadToAzure(
        req.files.photo[0].buffer,
        req.files.photo[0].originalname,
        req.files.photo[0].mimetype
      );
      candidate.personal.photo = url;
    }

    // RESUME UPLOAD
    if (req.files?.resume?.[0]) {
      const url = await uploadToAzure(
        req.files.resume[0].buffer,
        req.files.resume[0].originalname,
        req.files.resume[0].mimetype
      );
      candidate.professional.resume = url;
    }

    await candidate.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: candidate,
      profilePic: candidate.personal.photo,
    });

  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ error: "Server error updating profile" });
  }
};
