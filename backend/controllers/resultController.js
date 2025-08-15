const Result = require('../models/resultSchema');
const Parent = require('../models/studentSchemas'); // Parent model

// Upload a result file for a parent
const uploadResult = async (req, res) => {
  try {
    const { parentId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Verify parent exists
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Save result info in Result collection
    const newResult = new Result({
      parent: parentId,
      filePath: `/uploads/results/${req.file.filename}`, // relative path
      originalName: req.file.originalname,
    });

    const savedResult = await newResult.save();

    // Optionally, also store in parent's uploadedResults array
    parent.uploadedResults.push({
      filename: req.file.filename,
      fileUrl: newResult.filePath,
      uploadedAt: savedResult.uploadDate,
      description: req.body.description || ''
    }); 
    await parent.save();

    res.status(201).json({
      message: "Result uploaded successfully",
      result: savedResult
    });

  } catch (err) {
    console.error('uploadResult error:', err);
    res.status(500).json({ message: "Server error uploading result" });
  }
};

// Get all results for a given parent ID
const getParentResults = async (req, res) => {
  try {
    const parentId = req.params.parentId;

    // Verify parent exists
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Fetch results from Result collection
    const results = await Result.find({ parent: parentId }).sort({ uploadDate: -1 });

    // Map results to consistent frontend structure
    const formattedResults = results.map(r => ({
      _id: r._id,
      fileUrl: r.filePath,
      originalName: r.originalName,
      uploadedAt: r.uploadDate
    }));

    res.json(formattedResults);

  } catch (err) {
    console.error('getParentResults error:', err);
    res.status(500).json({ message: "Server error fetching results" });
  }
};

module.exports = {
  uploadResult,
  getParentResults
};
