const mongoose = require("mongoose");
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
  // Mixed so we can accept array<string> OR array<object>
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
  // job reference optional
  job: { type: Schema.Types.ObjectId, ref: "Job", required: false },
 
  // fallback fields
  jobTitle: { type: String, trim: true, index: true },
  jobEmbedded: { type: Schema.Types.Mixed },
 
  personal: { type: PersonalSchema, required: true },
  educations: { type: [EducationEntry], default: [] },
  professional: { type: ProfessionalEntry },
 
  status: { type: String, enum: ["Applied","Viewed","Shortlisted","Rejected","Hired"], default: "Applied" },
  publicVisible: { type: Boolean, default: false },
 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
 
// update updatedAt on save
ApplicationSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});
 
module.exports = mongoose.model("Application", ApplicationSchema);