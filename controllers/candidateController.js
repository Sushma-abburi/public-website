const Candidate = require("../models/Candidate");
const User = require("../models/User");   // ✅ ADD THIS

const uploadToAzure = require("../utils/uploadToAzure");
const jwt = require("jsonwebtoken");

// exports.createCandidate = async (req, res) => {
//   try {
//     const data = req.body;

//     // ✅ FIND USER BY EMAIL
//     const user = await User.findOne({ email: data.email });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // ✅ Generate Email Token
//     const emailToken = jwt.sign(
//       { email: data.email }, 
//       process.env.JWT_SECRET, 
//       { expiresIn: "1h" }
//     );

//     data.emailToken = emailToken;

//     // ✅ Upload resume to Azure
//     if (req.file) {
//       const url = await uploadToAzure(
//         req.file.buffer,
//         req.file.originalname,
//         req.file.mimetype
//       );
//       data.resume = url;
//     }

//     // ✅ SAVE CANDIDATE
//     const candidate = await Candidate.create(data);

//     // // ✅ ✅ ✅ MARK PROFILE AS COMPLETED
//     // user.isProfileCompleted = true;
//     // await user.save();

//     // ✅ MARK PROFILE AS COMPLETED + UPDATE NAME
//     user.firstName = data.firstName;
//     user.lastName = data.lastName;
//     user.isProfileCompleted = true;
//     await user.save();


//     const verificationLink = `https://your-frontend.com/candidate/verify?token=${emailToken}`;

//     res.status(201).json({
//       message: "Candidate created",
//       candidate,
//       user: {
//     firstName: user.firstName,
//     lastName: user.lastName,
//     email: user.email,
//    },
//       isProfileCompleted: true,   // ✅ Optional useful response
//       emailVerificationLink: verificationLink,
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
exports.createCandidate = async (req, res) => {
  try {
    // ✅ 1. HARD GUARD
    if (!req.body || !req.body.email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const {
      email,
      firstName,
      lastName,
      ...rest
    } = req.body;

    // ✅ 2. FIND USER
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ 3. TOKEN
    const emailToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const data = {
      email,
      firstName,
      lastName,
      ...rest,
      emailToken,
    };

    // ✅ 4. RESUME UPLOAD (OPTIONAL)
    if (req.file) {
      data.resume = await uploadToAzure(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    }

    // ✅ 5. SAVE CANDIDATE
    const candidate = await Candidate.create(data);

    // ✅ 6. UPDATE USER
    user.firstName = firstName;
    user.lastName = lastName;
    user.isProfileCompleted = true;
    await user.save();

    res.status(201).json({
      message: "Candidate created",
      candidate,
      isProfileCompleted: true,
    });

  } catch (error) {
    console.error("CREATE CANDIDATE ERROR:", error);
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
// exports.prefillApplication = async (req, res) => {
//   try {
//     // ✅ Fetch user first
//     const user = await User.findById(req.user.id).select("email");

//     if (!user || !user.email) {
//       return res.json({ prefillAvailable: false });
//     }

//     // ✅ Normalize email
//     const email = user.email.toLowerCase().trim();

//     const candidate = await Candidate.findOne({ email });

//     if (!candidate) {
//       return res.json({ prefillAvailable: false });
//     }

//     const prefillData = {
//       personal: {
//         firstName: candidate.firstName,
//         lastName: candidate.lastName,
//         email: candidate.email,
//         phone: candidate.phone,
//         alternativePhone: candidate.alternatePhone
//       },
//       educations: [
//         {
//           educationLevel: candidate.course,
//           department: candidate.department,
//           collegeName: candidate.college
//         }
//       ],
//       professional: {
//         jobType: candidate.employeeType,
//         companyName: candidate.companyName || "",
//         duration: candidate.experienceYears || "",
//         skills: candidate.skills || [],
//         resumeUrl: candidate.resume || ""
//       }
//     };

//     res.status(200).json({
//       prefillAvailable: true,
//       data: prefillData
//     });

//   } catch (err) {
//     console.error("Prefill error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

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

///saveOrUpdateProfile
// exports.saveOrUpdateProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("email");

//     if (!user || !user.email) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     const email = user.email.toLowerCase().trim();
//     const profileData = JSON.parse(req.body.profile);

//     // ✅ Handle resume upload
//     if (req.files?.resume?.[0]) {
//       const resumeUrl = await uploadToAzure(
//         req.files.resume[0].buffer,
//         req.files.resume[0].originalname,
//         req.files.resume[0].mimetype
//       );
//       profileData.professional.resume = resumeUrl;
//     }

//     // ✅ Handle photo upload (optional)
//     if (req.files?.photo?.[0]) {
//       const photoUrl = await uploadToAzure(
//         req.files.photo[0].buffer,
//         req.files.photo[0].originalname,
//         req.files.photo[0].mimetype
//       );
//       profileData.personal.photo = photoUrl;
//     }

//     const candidate = await Candidate.findOneAndUpdate(
//       { email },
//       {
//         $set: {
//           ...profileData.personal,
//           educations: profileData.educations,
//           professional: profileData.professional,
//         },
//       },
//       { new: true, upsert: true }
//     );

//     res.json({
//       success: true,
//       profilePic: candidate.personal?.photo || null,
//     });
//   } catch (err) {
//     console.error("Profile save error:", err);
//     res.status(500).json({ success: false, message: "Profile save failed" });
//   }
// };
exports.saveOrUpdateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("email");
    if (!user?.email)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const email = user.email.toLowerCase().trim();
    const profileData = JSON.parse(req.body.profile);

    const candidate = await Candidate.findOne({ email });

    // ✅ Resume
    if (req.files?.resume?.[0]) {
      profileData.professional.resume = await uploadToAzure(
        req.files.resume[0].buffer,
        req.files.resume[0].originalname,
        req.files.resume[0].mimetype
      );
    }

    // ✅ Photo
    if (req.files?.photo?.[0]) {
      profileData.photo = await uploadToAzure(
        req.files.photo[0].buffer,
        req.files.photo[0].originalname,
        req.files.photo[0].mimetype
      );
    }

    // ✅ BACKFILL EDUCATION ON FIRST SAVE
    if (
      (!profileData.educations || profileData.educations.length === 0) &&
      candidate
    ) {
      profileData.educations = [
        {
          course: candidate.course || "",
          department: candidate.department || "",
          collegeName: candidate.college || "",
          yearOfPassing: "",
        },
      ];
    }

    const updated = await Candidate.findOneAndUpdate(
      { email },
      {
        $set: {
          firstName: profileData.personal.firstName,
          lastName: profileData.personal.lastName,
          phone: profileData.personal.phone,
          alternatePhone: profileData.personal.alternatePhone,
          educations: profileData.educations,
          professional: profileData.professional,
          photo: profileData.photo,
        },
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      profilePic: updated.photo || null,
    });
  } catch (err) {
    console.error("Profile save error:", err);
    res.status(500).json({ success: false, message: "Profile save failed" });
  }
};
