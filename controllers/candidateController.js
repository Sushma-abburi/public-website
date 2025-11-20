const Candidate = require("../models/Candidate");

exports.createCandidate = async (req, res) => {
  try {
    const data = req.body;

    if (req.file) {
      data.resume = req.file.path;
    }

    const candidate = await Candidate.create(data);
    res.status(201).json({ message: "Candidate created", candidate });
  } catch (error) {
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

    if (req.file) {
      data.resume = req.file.path;
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
