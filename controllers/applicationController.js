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

// ✅ SAFE OBJECT ID CHECK (ADDED – NO LOGIC CHANGE)
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ✅ CREATE APPLICATION (UNCHANGED LOGIC)
exports.createApplication = async (req, res) => {
  try {
    // const personal = tryParseJSON(req.body.personal) || req.body.personal || {};
    let personal = tryParseJSON(req.body.personal) || req.body.personal || {};

// ✅ NORMALIZE EMAIL (MANDATORY)
personal.email =
  personal.email ||
  req.body.email ||
  req.body["personal[email]"] ||
  req.body["personal.email"] ||
  req.body.userEmail ||
  null;

// ✅ OPTIONAL BUT RECOMMENDED
personal.name =
  personal.name || req.body.name || req.body.fullName || null;

personal.contact =
  personal.contact || req.body.phone || req.body.mobile || null;

// ✅ FINAL CHECK (DO NOT REMOVE)
if (!personal.email) {
  return res.status(400).json({
    success: false,
    message: "Email is required to apply for a job",
  });
}
// ✅ FETCH USER BUSINESS ID (DTVB-0001)
const user = await User.findOne(
  { email: personal.email },
  { userId: 1 }
);

if (!user) {
  return res.status(404).json({
    success: false,
    message: "User not registered. Please register before applying.",
  });
}
    const educations = tryParseJSON(req.body.educations) || [];
    let professional =
      tryParseJSON(req.body.professional) || req.body.professional || {};

    if (!personal?.email) {
      return res.status(400).json({ error: "personal.email is required" });
    }

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

      if (req.files.certifications?.length) {
        const uploaded = [];
        for (const f of req.files.certifications) {
          const url = await uploadBufferToAzure(
            f.buffer,
            f.originalname,
            f.mimetype
          );
          if (url) uploaded.push(url);
        }
        professional.certificationsUrls = uploaded;
      }
    }

    professional.certifications = normalizeCertifications(
      professional.certifications
    );

    const jobObj = tryParseJSON(req.body.job);

    const jobEmbedded = jobObj
      ? {
          ...jobObj,
          jobType:
            req.body.jobType ||
            jobObj.jobType ||
            jobObj.type ||
            null,
        }
      : null;

    const appDoc = new Application({
      job: jobObj?._id || req.body.job || null,
      jobTitle: req.body.jobTitle || jobObj?.jobTitle || null,
      jobEmbedded,
      id:user.userId,//added user id
      // Location,
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

// ✅ PATCH (SAFE – FIXED CRASH)
exports.patchApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const updated = await Application.findByIdAndUpdate(
      id,
      { status, reason },
      { new: true }
    );

    res.json({ success: true, application: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET BY ID (SAFE – FIXED CastError)
exports.getApplicationById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const app = await Application.findById(req.params.id);
    res.json({ data: app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ HR VIEW (UNCHANGED)
exports.getApplicationsForHR = async (req, res) => {
  try {
    const docs = await Application.find({})
      .sort({ _id: -1 })
      .limit(50)
      .lean();

    res.status(200).json(docs);
  } catch (err) {
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

// ✅ USER BY EMAIL
exports.getApplicationsByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    const applications = await Application.find({
      "personal.email": email
    }).sort({ createdAt: -1 });

    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ JOB IDS
exports.getAppliedJobIdsByEmail = async (req, res) => {
  const { email } = req.query;

  const apps = await Application.find(
    { "personal.email": email },
    { job: 1 }
  );

  const jobIds = apps.map((a) => a.job?.toString());
  res.json({ success: true, data: jobIds });
};

// ✅ SUMMARY
exports.getSummaryStats = async (req, res) => {
  try {
    const totalApplied = await Application.countDocuments();
    const onHold = await Application.countDocuments({
      "professional.status": { $in: ["Viewed", "Shortlisted"] },
    });

    const hired = await Application.countDocuments({
      "professional.status": "Hired",
    });

    res.status(200).json({ totalApplied, onHold, hired });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch summary stats" });
  }
};

// ✅ MONTHLY STATS
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
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const formatted = data.map((d) => ({
    month: monthNames[d._id - 1],
    applied: d.applied,
  }));

  res.json({ success: true, data: formatted });
};

// ✅ MONTH FILTER
exports.getApplicationsByMonth = async (req, res) => {
  try {
    let { month, year } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    // ✅ Month name → number map
    const monthNamesMap = {
      january: 1,
      february: 2,
      march: 3,
      april: 4,
      may: 5,
      june: 6,
      july: 7,
      august: 8,
      september: 9,
      october: 10,
      november: 11,
      december: 12
    };

    // Convert month to number
    let monthNumber = Number(month);

    // If number conversion failed → try name
    if (isNaN(monthNumber)) {
      monthNumber = monthNamesMap[month.toLowerCase()];
    }

    // If both failed → invalid month
    if (!monthNumber) {
      return res.status(400).json({ message: "Invalid month. Use 1–12 or full month name." });
    }

    // Year fallback
    const yearNumber = Number(year) || new Date().getFullYear();

    const start = new Date(yearNumber, monthNumber - 1, 1);
    const end = new Date(yearNumber, monthNumber, 1);

    const applications = await Application.find({
      createdAt: { $gte: start, $lt: end },
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      month: monthNumber,
      year: yearNumber,
      count: applications.length,
      applications,
    });

  } catch (error) {
    console.error("getApplicationsByMonth ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getYearlyStats = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year + 1}-01-01`);

    const data = await Application.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Fill missing months with 0
    const months= [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

    const monthly = months.map((m, i) => {
      const found = data.find(d => d._id.month === i + 1);
      return { month: m, count: found ? found.count : 0 };
    });

    const total = monthly.reduce((s, m) => s + m.count, 0);

    res.json({ year, total, monthly });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch yearly stats" });
  }
};



// ✅ HIRED
exports.getHiredApplications = async (req, res) => {
  try {
    const docs = await Application.find({ status: "Hired" })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      applications: docs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE (SAFE – FIXED CRASH)
exports.deleteApplication = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: "Application deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ ON HOLD
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
    res.status(500).json({ error: err.message });
  }  
};
