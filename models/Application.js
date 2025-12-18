// models/Application.js
const mongoose = require("mongoose");
mongoose.set("bufferCommands", false);

const { Schema } = mongoose;
 
const PersonalSchema = new Schema({
  firstName: { type: String, trim: true },
  middleName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String },
  alternativePhone: { type: String },
  gender: { type: String },
  photoUrl: { type: String },
  currentAddress: { type: String },
  landmark: { type: String },
  pincode: { type: String },
  village: { type: String },
  state: { type: String },
  sameAddress: { type: Boolean, default: false },
  permanentAddress: { type: String },
  permanentLandmark: { type: String },
  permanentPincode: { type: String },
  permanentVillage: { type: String },
  permanentState: { type: String }
}, { _id: false });
 
const EducationEntry = new Schema({
  higherEducation: String,
  educationLevel: String,
  educationType: String,
  schoolName: String,
  collegeName: String,
  department: String,
  specialization: String,
  board: String,
  yearOfPassing: String,
  percentage: String
}, { _id: false });
 
const ProfessionalEntry = new Schema({
  jobType: String,
  skills: [String],
  projects: [Schema.Types.Mixed],
  linkedin: String,
  certifications: { type: Schema.Types.Mixed, default: [] },
  achievements: [String],
  companyName: String,
  companyLocation: String,
  jobTitle: String,
  startDate: Date,
  endDate: Date,
  roles: String,
  duration: String,
  salary: String,
  resumeUrl: String,
  certificateUrls: [String]
}, { _id: false });
 
const ApplicationSchema = new Schema({
  // store job as plain string (you asked for string type)
  job: { type: String, required: false },

 userId: {
  type: String,
  required: false,
  index: true,
},

  // optional user-visible title (can duplicate job)
  jobTitle: { type: String, trim: true, index: true },
 
  // if you want to store an embedded object separately, keep this (optional)
  jobEmbedded: { type: Schema.Types.Mixed },
  
  Location: { type: String, trim: true, index: true },
 
  personal: { type: PersonalSchema, required: true },
  educations: { type: [EducationEntry], default: [] },
  professional: { type: ProfessionalEntry },
 
  status: { type: String, enum: ["Applied","Viewed","Shortlisted","Rejected","Hired"], default: "Applied" },

  // ✅ ADD THIS
  reason: {
  type: String,
  default: null,
  trim: true
},

rejectedAt: {
  type: Date,
  default: null,
  index: true
},


  publicVisible: { type: Boolean, default: false },
 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
 
ApplicationSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});
 
module.exports = mongoose.model("Application", ApplicationSchema);