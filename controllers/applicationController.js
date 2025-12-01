// // controllers/applicationController.js
// const mongoose = require("mongoose");
// const Application = require("../models/Application");
 
// // optional azure config (your config/azureBlob.js)
// let blobServiceClient = null;
// let containerName = null;
// try {
//   const azureConfig = require("../config/azureBlob");
//   blobServiceClient = azureConfig.blobServiceClient;
//   containerName = azureConfig.containerName || "resumes";
// } catch (err) {
//   console.warn("Azure config not found; uploads will return null URLs.");
// }
 
// async function uploadBufferToAzure(buffer, originalName, mimeType) {
//   try {
//     if (!blobServiceClient) return null;
//     const { v4: uuidv4 } = require("uuid");
//     const blobName = `${uuidv4()}-${originalName}`;
//     const containerClient = blobServiceClient.getContainerClient(containerName);
//     try {
//       const exists = await containerClient.exists();
//       if (!exists) await containerClient.create();
//     } catch (e) {
//       console.warn("Azure container ensure failed:", e && e.message);
//     }
//     const blockBlobClient = containerClient.getBlockBlobClient(blobName);
//     await blockBlobClient.uploadData(buffer, { blobHTTPHeaders: { blobContentType: mimeType } });
//     return blockBlobClient.url;
//   } catch (err) {
//     console.error("uploadBufferToAzure error:", err && err.message);
//     return null;
//   }
// }
 
// function tryParseJSON(val) {
//   if (!val) return null;
//   if (typeof val === "object") return val;
//   try { return JSON.parse(val); } catch { return null; }
// }
 
// function parseLooseArray(input) {
//   if (!input || typeof input !== "string") return null;
//   const strict = tryParseJSON(input);
//   if (strict !== null) return strict;
//   let s = input.trim().replace(/\r\n/g, "\n").replace(/\n/g, " ");
//   s = s.replace(/'([^']*)'/g, function(_, inner) {
//     return `"${inner.replace(/"/g, '\\"')}"`;
//   });
//   s = s.replace(/,\s*([}\]])/g, "$1");
//   try { return JSON.parse(s); } catch { return null; }
// }
 
// function normalizeCertifications(raw) {
//   if (raw === undefined || raw === null) return [];
//   if (Array.isArray(raw)) return raw;
//   if (typeof raw === "object") return [raw];
//   if (typeof raw === "string") {
//     const parsed = tryParseJSON(raw) || parseLooseArray(raw);
//     if (parsed && Array.isArray(parsed)) return parsed;
//     if (parsed && typeof parsed === "object") return [parsed];
//     if (raw.indexOf(",") !== -1) return raw.split(",").map(s => s.trim()).filter(Boolean);
//     return [raw];
//   }
//   return [String(raw)];
// }
 
// // CREATE
// async function createApplication(req, res) {
//   try {
//     const personal = tryParseJSON(req.body.personal) || req.body.personal || {};
//     const educations = tryParseJSON(req.body.educations) || tryParseJSON(req.body.education) || null;
//     let professional = tryParseJSON(req.body.professional) || req.body.professional || {};
 
//     if (!personal || !personal.email) {
//       return res.status(400).json({ error: "personal.email is required" });
//     }
 
//     // handle files
//     if (req.files) {
//       if (req.files.photo && req.files.photo[0]) {
//         const f = req.files.photo[0];
//         const url = await uploadBufferToAzure(f.buffer, f.originalname, f.mimetype);
//         personal.photoUrl = url || personal.photoUrl;
//       }
//       if (req.files.resume && req.files.resume[0]) {
//         const f = req.files.resume[0];
//         const url = await uploadBufferToAzure(f.buffer, f.originalname, f.mimetype);
//         professional.resumeUrl = url || professional.resumeUrl;
//       }
//       if (req.files.certificates && req.files.certificates.length) {
//         const uploaded = [];
//         for (const f of req.files.certificates) {
//           const url = await uploadBufferToAzure(f.buffer, f.originalname, f.mimetype);
//           if (url) uploaded.push(url);
//         }
//         professional.certificateUrls = (professional.certificateUrls || []).concat(uploaded);
//       }
//     }
 
//     // normalize certifications
//     const rawCerts = professional.certifications || req.body.certifications || null;
//     professional.certifications = normalizeCertifications(rawCerts);
 
//     // JOB handling: store job as plain string (or derive from job object)
//     // Accepts:
//     // - req.body.job (string or JSON object)
//     // - req.body.jobTitle (explicit)
//     let jobRaw = req.body.job || null;
//     // If job is JSON string, parse it
//     const jobParsed = tryParseJSON(jobRaw);
//     let jobString = null;
//     let jobEmbedded = undefined;
 
//     if (jobParsed && typeof jobParsed === "object") {
//       // try to take a sensible string title from parsed object
//       jobEmbedded = jobParsed;
//       jobString = jobParsed.title || jobParsed.name || jobParsed.jobTitle || null;
//     } else if (jobRaw) {
//       jobString = String(jobRaw);
//     }
 
//     // If jobTitle provided explicitly, prefer that
//     const jobTitleFromReq = req.body.jobTitle || jobString || null;
 
//     const appDoc = new Application({
//       job: jobString,                // will be string (or null)
//       jobTitle: jobTitleFromReq,
//       jobEmbedded: jobEmbedded,
//       personal,
//       educations: Array.isArray(educations) ? educations : (educations ? [educations] : []),
//       professional
//     });
 
//     await appDoc.save();
//     return res.status(201).json({ message: "Application submitted", application: appDoc });
//   } catch (err) {
//     console.error("createApplication error:", err && (err.stack || err.message));
//     if (err && err.name === "ValidationError") {
//       return res.status(400).json({ error: "Validation error", details: err.message });
//     }
//     return res.status(500).json({ error: "Server error", details: err && err.message });
//   }
// }
 
// // PATCH (update)
// async function patchApplication(req, res) {
//   try {
//     const { id } = req.params;
//     if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid application id" });
 
//     const app = await Application.findById(id);
//     if (!app) return res.status(404).json({ error: "Application not found" });
 
//     const personalParsed = tryParseJSON(req.body.personal) || req.body.personal;
//     const educationsParsed = tryParseJSON(req.body.educations) || tryParseJSON(req.body.education);
//     let professionalParsed = tryParseJSON(req.body.professional) || req.body.professional;
 
//     if (personalParsed) app.personal = { ...app.personal, ...personalParsed };
//     if (Array.isArray(educationsParsed)) app.educations = educationsParsed;
//     if (professionalParsed) app.professional = { ...app.professional, ...professionalParsed };
 
//     // files
//     if (req.files) {
//       if (req.files.photo && req.files.photo[0]) {
//         const f = req.files.photo[0];
//         const url = await uploadBufferToAzure(f.buffer, f.originalname, f.mimetype);
//         if (url) app.personal.photoUrl = url;
//       }
//       if (req.files.resume && req.files.resume[0]) {
//         const f = req.files.resume[0];
//         const url = await uploadBufferToAzure(f.buffer, f.originalname, f.mimetype);
//         if (url) app.professional = app.professional || {};
//         app.professional.resumeUrl = url;
//       }
//       if (req.files.certificates && req.files.certificates.length) {
//         const uploaded = [];
//         for (const f of req.files.certificates) {
//           const url = await uploadBufferToAzure(f.buffer, f.originalname, f.mimetype);
//           if (url) uploaded.push(url);
//         }
//         app.professional = app.professional || {};
//         app.professional.certificateUrls = (app.professional.certificateUrls || []).concat(uploaded);
//       }
//     }
 
//     // normalize certifications if provided
//     const rawCerts = (professionalParsed && professionalParsed.certifications) || req.body.certifications;
//     if (rawCerts !== undefined) {
//       app.professional = app.professional || {};
//       app.professional.certifications = normalizeCertifications(rawCerts);
//     }
 
//     // JOB update: same logic — accept string or JSON object, store string in job
//     let jobRaw = req.body.job !== undefined ? req.body.job : undefined;
//     if (jobRaw !== undefined) {
//       const jobParsed = tryParseJSON(jobRaw);
//       if (jobParsed && typeof jobParsed === "object") {
//         app.jobEmbedded = jobParsed;
//         app.job = jobParsed.title || jobParsed.name || jobParsed.jobTitle || app.job;
//         if (!app.jobTitle) app.jobTitle = jobParsed.title || jobParsed.name || jobParsed.jobTitle || app.jobTitle;
//       } else {
//         app.job = jobRaw !== null ? String(jobRaw) : app.job;
//       }
//     }
 
//     if (req.body.jobTitle) app.jobTitle = req.body.jobTitle;
 
//     await app.save();
//     return res.json({ message: "Application updated", application: app });
//   } catch (err) {
//     console.error("patchApplication error:", err && (err.stack || err.message));
//     return res.status(500).json({ error: "Server error", details: err && err.message });
//   }
// }
 
// // GET / helpers (unchanged)
// async function getApplicationById(req, res) {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
//     const app = await Application.findById(id).lean();
//     if (!app) return res.status(404).json({ error: "Application not found" });
//     return res.json({ data: app });
//   } catch (err) {
//     console.error("getApplicationById error:", err && err.message);
//     return res.status(500).json({ error: "Server error", details: err && err.message });
//   }
// }
 
// async function getApplicationsForHR(req, res) {
//   try {
//     const { page = 1, limit = 20, search, jobTitle } = req.query;
//     const q = {};
//     if (jobTitle) q.jobTitle = new RegExp(jobTitle, "i");
//     if (search) q.$or = [
//       { "personal.firstName": new RegExp(search, "i") },
//       { "personal.lastName": new RegExp(search, "i") },
//       { "personal.email": new RegExp(search, "i") },
//       { jobTitle: new RegExp(search, "i") }
//     ];
//     const docs = await Application.find(q).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit, 10)).lean();
//     const total = await Application.countDocuments(q);
//     return res.json({ page: parseInt(page, 10), limit: parseInt(limit, 10), total, data: docs });
//   } catch (err) {
//     console.error("getApplicationsForHR error:", err && err.message);
//     return res.status(500).json({ error: "Server error", details: err && err.message });
//   }
// }
 
// async function getPublicApplications(req, res) {
//   try {
//     const { limit = 20 } = req.query;
//     const docs = await Application.find({ publicVisible: true }).sort({ createdAt: -1 }).limit(parseInt(limit, 10)).lean();
//     return res.json({ data: docs });
//   } catch (err) {
//     console.error("getPublicApplications error:", err && err.message);
//     return res.status(500).json({ error: "Server error", details: err && err.message });
//   }
// }
 
// async function getApplicationsByEmail(req, res) {
//   try {
//     const { email } = req.query;
//     if (!email) return res.status(400).json({ error: "email required" });
//     const docs = await Application.find({ "personal.email": email }).sort({ createdAt: -1 }).lean();
//     return res.json({ data: docs });
//   } catch (err) {
//     console.error("getApplicationsByEmail error:", err && err.message);
//     return res.status(500).json({ error: "Server error", details: err && err.message });
//   }
// }
 
// async function deleteApplication(req, res) {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
//     const doc = await Application.findByIdAndDelete(id);
//     if (!doc) return res.status(404).json({ error: "Application not found" });
//     return res.json({ message: "Deleted", id });
//   } catch (err) {
//     console.error("deleteApplication error:", err && err.message);
//     return res.status(500).json({ error: "Server error", details: err && err.message });
//   }
// }
 
// module.exports = {
//   createApplication,
//   patchApplication,
//   getApplicationById,
//   getApplicationsForHR,
//   getPublicApplications,
//   getApplicationsByEmail,
//   deleteApplication
// };
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

// ✅ ✅ CREATE APPLICATION (WITH DUPLICATE BLOCK + AUTO AZURE)
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

    const appDoc = new Application({
      job: req.body.job || null,
      jobTitle: req.body.jobTitle || null,
      jobEmbedded: tryParseJSON(req.body.job),
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
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid application id" });

    const app = await Application.findById(id);
    if (!app) return res.status(404).json({ error: "Application not found" });

    Object.assign(app.personal, tryParseJSON(req.body.personal));
    Object.assign(app.professional, tryParseJSON(req.body.professional));

    await app.save();
    res.json({ message: "Application updated", application: app });
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
// exports.getApplicationsForHR = async (req, res) => {
//   const docs = await Application.find().sort({ createdAt: -1 });
//   res.json({ data: docs });
// };
exports.getApplicationsForHR = async (req, res) => {
  const docs = await Application.find().sort({ createdAt: -1 });
  res.json(docs);   // ✅ SEND ARRAY DIRECTLY
};


// ✅ PUBLIC VIEW
exports.getPublicApplications = async (req, res) => {
  const docs = await Application.find({ publicVisible: true });
  res.json({ data: docs });
};

// ✅ USER APPLIED JOBS BY EMAIL
exports.getApplicationsByEmail = async (req, res) => {
  const { email } = req.query;
  const docs = await Application.find({ "personal.email": email });
  res.json({ data: docs });
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
  const totalApplied = await Application.countDocuments();
  const onHold = await Application.countDocuments({
    status: { $in: ["Viewed", "Shortlisted"] },
  });
  const hired = await Application.countDocuments({ status: "Hired" });

  res.json({ totalApplied, onHold, hired });
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
