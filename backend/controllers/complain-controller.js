const Complain = require('../models/complainSchema.js');

const complainCreate = async (req, res) => {
    try {
        const complain = new Complain(req.body)
        const result = await complain.save()
        res.send(result)
    } catch (err) {
        res.status(500).json(err);
    }
};

// Fixed: For admin to see all complaints in their school
const complainList = async (req, res) => {
    try {
        let complains = await Complain.find({ 
            school: req.params.id, // Only filter by school for admin view
            // Removed user filter so admin can see all complaints
        }).populate("user", "name");
        
        if (complains.length > 0) {
            res.send(complains)
        } else {
            res.send({ message: "No complains found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// For specific user's complaints
const userComplainsList = async (req, res) => {
    try {
        let complains = await Complain.find({ 
            user: req.params.userId // Filter by user ID
        })
        .populate("user", "name")
        .populate("school", "schoolName");
        
        if (complains.length > 0) {
            res.send(complains)
        } else {
            res.send({ message: "No complains found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Fixed: Simplified function to get complaints by user
const getComplainsByUser = async (req, res) => {
    try {
        console.log('Fetching complaints for user:', req.params.userId);
        
        let complains = await Complain.find({ 
            user: req.params.userId 
        })
        .populate("user", "name")
        .populate("school", "schoolName");
        
        console.log('Found complaints:', complains.length);
        
        if (complains.length > 0) {
            res.send(complains)
        } else {
            res.send({ message: "No complains found" });
        }
    } catch (err) {
        console.error('Error fetching complaints:', err);
        res.status(500).json(err);
    }
};

module.exports = { complainCreate, getComplainsByUser, complainList, userComplainsList };