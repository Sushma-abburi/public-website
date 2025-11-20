const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String },

    course: { type: String, required: true },
    otherCourse: { type: String },

    department: { type: String, required: true },
    // yearOfPassing: { type: Number, required: true },
    college: { type: String, required: true },

    gradeType: { type: String, enum: ["CGPA", "Percentage"], required: true },
        cgpa: { type: String, required: true },


    employeeType: { type: String, enum: ["Fresher", "Experienced"], required: true },

    companyName: { type: String },
    experienceYears: { type: Number },

    resume: { type: String }, // file path

    skills: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);
candidateSchema.pre("validate", function(next) {
  if (this.gradeType) {
    this.gradeType = this.gradeType.toUpperCase();
  }
  next();
});


module.exports = mongoose.model("Candidate", candidateSchema);
