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

// Updated: For admin to see all complaints in their school
// This handles both user ID (admin) and school ID parameters
const getAllComplains = async (req, res) => {
    try {
        const { id } = req.params;
        const { address } = req.query; // Get address from query params
        
        console.log('getAllComplains called with:', { id, address });
        
        let complains;
        
        // If this is called for complaints, find by school ID
        if (address === "Complain") {
            // Assuming the id passed is the admin's user ID, we need to find their school
            // You might need to adjust this based on your admin model structure
            complains = await Complain.find({ 
                school: id, // Use the ID as school ID directly
            })
            .populate("user", "name")
            .sort({ createdAt: -1 }); // Sort by newest first
        } else {
            // Handle other address types if needed
            complains = await Complain.find({ 
                school: id 
            })
            .populate("user", "name")
            .sort({ createdAt: -1 });
        }
        
        if (complains.length > 0) {
            res.send(complains)
        } else {
            res.send({ message: "No complains found" });
        }
    } catch (err) {
        console.error('Error in getAllComplains:', err);
        res.status(500).json(err);
    }
};

// Alternative function that specifically gets complaints by school ID
const complainList = async (req, res) => {
    try {
        let complains = await Complain.find({ 
            school: req.params.id, // Filter by school ID
        })
        .populate("user", "name")
        .sort({ createdAt: -1 }); // Sort by newest first
        
        if (complains.length > 0) {
            res.send(complains)
        } else {
            res.send({ message: "No complains found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// For specific user's complaints (parents viewing their own)
const userComplainsList = async (req, res) => {
    try {
        let complains = await Complain.find({ 
            user: req.params.userId // Filter by user ID
        })
        .populate("user", "name")
        .populate("school", "schoolName")
        .sort({ createdAt: -1 }); // Sort by newest first
        
        if (complains.length > 0) {
            res.send(complains)
        } else {
            res.send({ message: "No complains found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get complaints by user (used by parents to see their own complaints)
const getComplainsByUser = async (req, res) => {
    try {
        console.log('Fetching complaints for user:', req.params.userId);
        
        let complains = await Complain.find({ 
            user: req.params.userId 
        })
        .populate("user", "name")
        .populate("school", "schoolName")
        .sort({ createdAt: -1 }); // Sort by newest first
        
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

// NEW: Reply to a complaint (Admin functionality)
const replyToComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { response, status, responseDate, adminId } = req.body;

        console.log('Replying to complaint:', id);
        console.log('Response data:', { response, status, responseDate });

        // Validate input
        if (!response || !response.trim()) {
            return res.status(400).json({ 
                success: false, 
                message: "Response cannot be empty" 
            });
        }

        // Update the complaint with admin response
        const updatedComplaint = await Complain.findByIdAndUpdate(
            id,
            {
                response: response.trim(),
                status: status || 'Responded',
                responseDate: responseDate || new Date(),
                assignedTo: adminId // Optional: track which admin replied
            },
            { 
                new: true, // Return updated document
                runValidators: true 
            }
        )
        .populate("user", "name")
        .populate("school", "schoolName");

        if (!updatedComplaint) {
            return res.status(404).json({ 
                success: false, 
                message: "Complaint not found" 
            });
        }

        console.log('Successfully updated complaint:', updatedComplaint._id);

        res.json({
            success: true,
            message: "Reply sent successfully",
            complaint: updatedComplaint
        });

    } catch (err) {
        console.error('Error replying to complaint:', err);
        res.status(500).json({ 
            success: false, 
            message: "Server error while sending reply",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// NEW: Update complaint status (Admin functionality)
const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assignedTo } = req.body;

        console.log('Updating complaint status:', id, 'to:', status);

        const updatedComplaint = await Complain.findByIdAndUpdate(
            id,
            { 
                status,
                assignedTo,
                ...(status === 'In Progress' && { responseDate: new Date() })
            },
            { 
                new: true, 
                runValidators: true 
            }
        )
        .populate("user", "name")
        .populate("school", "schoolName");

        if (!updatedComplaint) {
            return res.status(404).json({ 
                success: false, 
                message: "Complaint not found" 
            });
        }

        res.json({
            success: true,
            message: "Status updated successfully",
            complaint: updatedComplaint
        });

    } catch (err) {
        console.error('Error updating complaint status:', err);
        res.status(500).json({ 
            success: false, 
            message: "Server error while updating status",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports = { 
    complainCreate, 
    getAllComplains,     // Main function for getting complaints
    complainList,        // Alternative function 
    getComplainsByUser, 
    userComplainsList,
    replyToComplaint,    // New reply function
    updateComplaintStatus // New status update function
};