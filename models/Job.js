const mongoose = require("mongoose");
const Schema = mongoose.Schema;
 
const JobSchema = new Schema({
  title: { type: String, required: true, index: true },
  code: { type: String, index: true },        // optional human-friendly code (e.g. Emp101)
  slug: { type: String, index: true },        // optional slug
  department: String,
  location: String,
  description: String,
  requirements: [String],
  isActive: { type: Boolean, default: true },
  postedAt: { type: Date, default: Date.now }
});
 
// Optional: create a text index to allow title searches
JobSchema.index({ title: "text", description: "text" });
 
module.exports = mongoose.model("Job", JobSchema);