const Result = require('../models/resultSchema');
const Parent = require('../models/studentSchemas'); // Parent model

// Upload a result file for a parent
const uploadResult = async (req, res) => {
  try {
    const { parentId, subject, semester, examType, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Verify parent exists
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Save result info in Result collection with additional metadata
    const newResult = new Result({
      parent: parentId,
      filePath: `/uploads/results/${req.file.filename}`, // relative path
      originalName: req.file.originalname,
      subject: subject || 'General',
      semester: semester,
      examType: examType,
      description: description || ''
    });

    const savedResult = await newResult.save();

    // Also store in parent's uploadedResults array with metadata
    if (!parent.uploadedResults) {
      parent.uploadedResults = [];
    }
    
    parent.uploadedResults.push({
      filename: req.file.filename,
      fileUrl: newResult.filePath,
      originalName: req.file.originalname,
      uploadedAt: savedResult.uploadDate,
      subject: subject || 'General',
      semester: semester,
      examType: examType,
      description: description || ''
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

    // Map results to consistent frontend structure with all metadata
    const formattedResults = results.map(r => ({
      _id: r._id,
      fileUrl: r.filePath,
      originalName: r.originalName,
      uploadedAt: r.uploadDate,
      subject: r.subject || 'General',
      semester: r.semester,
      examType: r.examType,
      description: r.description,
      mimeType: r.mimeType // Include mimeType if available
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