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

// In complain-controller.js
const complainList = async (req, res) => {
    try {
        let complains = await Complain.find({ 
            school: req.params.id,
            user: req.user.id // Add this to filter by user
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
// In complain-controller.js
const userComplainsList = async (req, res) => {
    try {
        let complains = await Complain.find({ 
            user: req.params.userId // Filter by user ID
        })
        .populate("user", "name")
        .populate("school", "name");
        
        if (complains.length > 0) {
            res.send(complains)
        } else {
            res.send({ message: "No complains found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};
// In complain-controller.js
const getComplainsByUser = async (req, res) => {
    try {
        console.log('Fetching complaints for user:', req.params.userId);
        
        let complains = await Complain.find({ 
            user: req.params.userId // Filter by user ID
        })
        .populate("user", "name")
        .populate("school", "name");
        
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

module.exports = { complainCreate,getComplainsByUser, complainList, userComplainsList };
