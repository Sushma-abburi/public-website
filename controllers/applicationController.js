const mongoose = require("mongoose");
const Application = require("../models/Application");

// ✅ AZURE CONFIG
let blobServiceClient = null;
let containerName = null;
try {
  const azureConfig = require("../config/azureBlob");
  blobServiceClient = azureConfig.blobServiceClient;
  containerName = azureConfig.containerName || "resumes";
} catch (err) {
  console.warn("Azure config not found; uploads will return null URLs.");
}

// ✅ AZURE UPLOAD HELPER
async function uploadBufferToAzure(buffer, originalName, mimeType) {
  try {
    if (!blobServiceClient) return null;
    const { v4: uuidv4 } = require("uuid");
    const blobName = `${uuidv4()}-${originalName}`;
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const exists = await containerClient.exists();
    if (!exists) await containerClient.create();

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    return blockBlobClient.url;
  } catch (err) {
    console.error("Azure upload error:", err.message);
    return null;
  }
}

// ✅ JSON PARSERS
function tryParseJSON(val) {
  if (!val) return null;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}

function normalizeCertifications(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object") return [raw];
  if (typeof raw === "string") {
    if (raw.includes(",")) return raw.split(",").map((s) => s.trim());
    return [raw];
  }
  return [String(raw)];
}

exports.createApplication = async (req, res) => {
  try {
    const personal = tryParseJSON(req.body.personal) || req.body.personal || {};
    const educations = tryParseJSON(req.body.educations) || [];
    let professional =
      tryParseJSON(req.body.professional) || req.body.professional || {};

    if (!personal?.email) {
      return res.status(400).json({ error: "personal.email is required" });
    }

    // ✅ DUPLICATE APPLY PREVENTION
    if (req.body.job) {
      const exists = await Application.findOne({
        job: req.body.job,
        "personal.email": personal.email,
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          msg: "You already applied for this job",
        });
      }
    }

    // ✅ FILE HANDLING
    if (req.files) {
      if (req.files.photo?.[0]) {
        const f = req.files.photo[0];
        personal.photoUrl = await uploadBufferToAzure(
          f.buffer,
          f.originalname,
          f.mimetype
        );
      }

      if (req.files.resume?.[0]) {
        const f = req.files.resume[0];
        professional.resumeUrl = await uploadBufferToAzure(
          f.buffer,
          f.originalname,
          f.mimetype
        );
      }

      if (req.files.certificates?.length) {
        const uploaded = [];
        for (const f of req.files.certificates) {
          const url = await uploadBufferToAzure(
            f.buffer,
            f.originalname,
            f.mimetype
          );
          if (url) uploaded.push(url);
        }
        professional.certificateUrls = uploaded;
      }
    }

    professional.certifications = normalizeCertifications(
      professional.certifications
    );

    // ✅ ✅ ✅ MAIN FIX — JOB PARSING
const jobObj = tryParseJSON(req.body.job);

// ✅ ✅ ✅ FORCE JOB TYPE INTO jobEmbedded
const jobEmbedded = jobObj
  ? {
      ...jobObj,
      jobType:
        req.body.jobType ||        // ✅ from frontend
        jobObj.jobType ||          // ✅ from job object
        jobObj.type ||             // ✅ fallback
        null,
    }
  : null;

// ✅ ✅ ✅ STORE JOB CORRECTLY
const appDoc = new Application({
  job: jobObj?._id || req.body.job || null,
  jobTitle: req.body.jobTitle || jobObj?.jobTitle || null,
  jobEmbedded,                    // ✅ FIXED
  personal,
  educations,
  professional,
});


    await appDoc.save();

    return res
      .status(201)
      .json({ message: "Application submitted", application: appDoc });

  } catch (err) {
    console.error("createApplication error:", err.message);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ✅ UPDATE APPLICATION
exports.patchApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Application.findByIdAndUpdate(
      id,
      { 
        status: req.body.status,   // ✅ VERY IMPORTANT
        reason: req.body.reason 
      },
      { new: true }
    );

    res.json({ success: true, application: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ GET BY ID
exports.getApplicationById = async (req, res) => {
  const app = await Application.findById(req.params.id);
  res.json({ data: app });
};

// ✅ HR VIEW
exports.getApplicationsForHR = async (req, res) => {
  try {
    console.log("HR API HIT");

    const docs = await Application.find({})
      .sort({ _id: -1 })
      .limit(50)     // ✅ LIMIT
      .lean();       // ✅ FAST RESPONSE

    res.status(200).json(docs);
  } catch (err) {
    console.error("HR API ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch HR applications",
      error: err.message,
    });
  }
};



// ✅ PUBLIC VIEW
exports.getPublicApplications = async (req, res) => {
  const docs = await Application.find({ publicVisible: true });
  res.json({ data: docs });
};

// ✅ USER APPLIED JOBS BY EMAIL
exports.getApplicationsByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    const applications = await Application.find({
      "personal.email": email
    }).sort({ createdAt: -1 });

    res.json({ applications });
  } catch (err) {
    console.error("Get applications error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ ✅ APPLIED JOB IDS (FOR "ALREADY APPLIED" BADGE)
exports.getAppliedJobIdsByEmail = async (req, res) => {
  const { email } = req.query;

  const apps = await Application.find(
    { "personal.email": email },
    { job: 1 }
  );

  const jobIds = apps.map((a) => a.job?.toString());
  res.json({ success: true, data: jobIds });
};

// ✅ ✅ ADMIN SUMMARY STATS

exports.getSummaryStats = async (req, res) => {
  try {
    const totalApplied = await Application.countDocuments();

    // ✅ SAFE STATUS COUNT (nested inside professional)
    const onHold = await Application.countDocuments({
      "professional.status": { $in: ["Viewed", "Shortlisted"] },
    });

    const hired = await Application.countDocuments({
      "professional.status": "Hired",
    });

    res.status(200).json({ totalApplied, onHold, hired });
  } catch (error) {
    console.error("SUMMARY STATS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch summary stats",
      error: error.message,
    });
  }
};

// ✅ ✅ MONTHLY APPLICATION STATS (CHART)
exports.getMonthlyStats = async (req, res) => {
  const data = await Application.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        applied: { $sum: 1 },
      },
    },
    { $sort: { "_id": 1 } },
  ]);

  const monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const formatted = data.map((d) => ({
    month: monthNames[d._id - 1],
    applied: d.applied,
  }));

  res.json({ success: true, data: formatted });
};

// ✅ DELETE
exports.deleteApplication = async (req, res) => {
  await Application.findByIdAndDelete(req.params.id);
  res.json({ message: "Application deleted" });
};

//Hold
// ✅ GET ON-HOLD (SHORTLISTED) APPLICATIONS
exports.getOnHoldApplications = async (req, res) => {
  try {
    const docs = await Application.find({ status: "Shortlisted" })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      applications: docs
    });

  } catch (err) {
    console.error("OnHold API Error:", err);
    res.status(500).json({ error: err.message });
  }
};
