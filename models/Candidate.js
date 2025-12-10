// const mongoose = require("mongoose");
// mongoose.set("bufferCommands", false);

// const candidateSchema = new mongoose.Schema(
//   {
//     firstName: { type: String, required: true },
//     lastName: { type: String, required: true },

//     email: { type: String, required: true, unique: true },
//     phone: { type: String, required: true },
//     alternatePhone: { type: String },

//     course: { type: String, required: true },
//     otherCourse: { type: String },

//     department: { type: String, required: true },
//     // yearOfPassing: { type: Number, required: true },
//     college: { type: String, required: true },

//     gradeType: { type: String, enum: ["CGPA", "Percentage"], required: true },
//         cgpa: { type: String, required: true },


//     employeeType: { type: String, enum: ["Fresher", "Experienced"], required: true },

//     companyName: { type: String },
//     experienceYears: { type: Number },

//     resume: { type: String }, // file path

//     skills: {
//       type: [String],
//       default: [],
//     },
//   },
//   { timestamps: true }
// );
// candidateSchema.pre("validate", function(next) {
//   if (this.gradeType) {
//     this.gradeType = this.gradeType.toUpperCase();
//   }
//   next();
// });


// module.exports = mongoose.model("Candidate", candidateSchema);
const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema({
  companyName: String,
  companyLocation: String,
  jobTitle: String,
  startDate: String,
  endDate: String,
  roles: String,
  duration: String,
});

const educationSchema = new mongoose.Schema({
  course: String,
  department: String,
  collegeName: String,
  yearOfPassing: String,
});

const professionalSchema = new mongoose.Schema({
  jobType: String,
  currentCompany: String,
  designation: String,
  website: String,
  linkedin: String,
  github: String,
  skills: [String],
  certifications: [String],
  projects: [String],
  experiences: [experienceSchema],
  achievements: String,
  salary: String,
  resume: String,
});

const candidateSchema = new mongoose.Schema(
  {
    // ✅ BASIC INFO (used by both application & profile)
    firstName: String,
    lastName: String,
    email: { type: String, required: true, unique: true },
    phone: String,
    alternatePhone: String,

    // ✅ ORIGINAL APPLICATION FIELDS (KEEP THESE)
    course: String,
    otherCourse: String,
    department: String,
    college: String,
    gradeType: { type: String, enum: ["CGPA", "PERCENTAGE"] },
    cgpa: String,
    employeeType: { type: String, enum: ["Fresher", "Experienced"] },
    companyName: String,
    experienceYears: Number,
    skills: [String],
    resume: String,

    // ✅ PROFILE EXTENSIONS (NEW)
    educations: [educationSchema],
    professional: professionalSchema,
    photo: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);
