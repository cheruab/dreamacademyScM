const bcrypt = require('bcrypt');
const Parent = require('../models/studentSchemas.js');
const Result = require('../models/resultSchema');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const Complaint = require('../models/complainSchema.js'); // <-- Import complaint model (adjust path if needed)

const parentRegister = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        const existingParent = await Parent.findOne({
            name: req.body.name,
            school: req.body.adminID,
            role: 'Parent'
        });

        if (existingParent) {
            return res.send({ message: 'Parent with this name already exists' });
        }

        if (req.body.child) {
            const parentWithSameChild = await Parent.findOne({ 
                child: req.body.child,
                role: 'Parent'
            });
            if (parentWithSameChild) {
                return res.send({ 
                    message: 'This student is already assigned to another parent' 
                });
            }
        }

        const parent = new Parent({
            ...req.body,
            school: req.body.adminID,
            password: hashedPass,
            role: 'Parent'
        });

        let result = await parent.save();

        if (req.body.child) {
            await Student.findByIdAndUpdate(req.body.child, {
                parent: result._id
            });
        }

        result.password = undefined;
        res.send(result);

    } catch (err) {
        res.status(500).json(err);
    }
};

const parentLogIn = async (req, res) => {
    try {
        let parent = await Parent.findOne({ 
            name: req.body.parentName,
            role: 'Parent'
        }).select('+password')
        .populate({
            path: 'child',
            populate: [
                { path: 'sclassName', select: 'sclassName' },
                { path: 'school', select: 'schoolName' },
                { path: 'attendance.subName', select: 'subName' },
                { path: 'examResult.subName', select: 'subName' },
            ]
        });

        if (parent) {
            const validated = await bcrypt.compare(req.body.password, parent.password);
            if (validated) {
                parent = await parent.populate("school", "schoolName");
                const parentData = {
                    _id: parent._id,
                    name: parent.name,
                    role: parent.role,
                    school: parent.school,
                    child: parent.child
                };
                res.status(200).json({
                    success: true,
                    message: "Login successful",
                    parent: parentData
                });
            } else {
                res.status(401).json({ success: false, message: "Invalid password" });
            }
        } else {
            res.status(404).json({ success: false, message: "Parent not found" });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};

const getParents = async (req, res) => {
    try {
        let parents = await Parent.find({ 
            school: req.params.id,
            role: 'Parent'
        })
        .populate("sclassName", "sclassName")
        .populate("child", "name rollNum sclassName");

        if (parents.length > 0) {
            let modifiedParents = parents.map((parent) => {
                return { ...parent._doc, password: undefined };
            });
            res.send(modifiedParents);
        } else {
            res.send({ message: "No parents found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getParentDetail = async (req, res) => {
    try {
        let parent = await Parent.findById(req.params.id)
            .populate("school", "schoolName")
            .populate("sclassName", "sclassName")
            .populate('examResult.subName', 'subName')
            .populate({
                path: 'child',
                populate: [
                    { path: 'sclassName', select: 'sclassName' },
                    { path: 'attendance.subName', select: 'subName' },
                    { path: 'examResult.subName', select: 'subName' },

                    
                    
                ]
            });

        if (parent) {
            parent.password = undefined;
            res.send(parent);
        }
        else {
            res.send({ message: "No parent found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Replace the getMyChild function in your student_controllers.js with this improved version:

// In student_controllers.js, update the getMyChild function
// In student_controllers.js, update the getMyChild function:

const getMyChild = async (req, res) => {
    try {
        const parentId = req.params.parentId;

        console.log("Fetching child for parentId:", parentId);

        // First, get the parent to find the child ID
        const parent = await Parent.findById(parentId).lean();

        if (!parent) {
            console.log("Parent not found");
            return res.status(404).send({ message: "Parent not found" });
        }

        if (!parent.child) {
            console.log("No child assigned to this parent");
            return res.status(404).send({ message: "No child assigned to this parent" });
        }

        // Then get the child with all necessary population
        const child = await Student.findById(parent.child)
            .populate('sclassName', 'sclassName _id') // Make sure to include _id in the select
            .populate('school', 'schoolName')
            .populate({
                path: 'attendance.subName', 
                select: 'subName subCode'
            })
            .populate({
                path: 'examResult.subName', 
                select: 'subName subCode'
            });

        if (!child) {
            console.log("Child not found");
            return res.status(404).send({ message: "Child not found" });
        }

        // Remove password from response
        const childData = child.toObject();
        delete childData.password;

        // Debug log to see the structure
        console.log("Child sclassName structure:", {
            sclassName: childData.sclassName,
            type: typeof childData.sclassName,
            isArray: Array.isArray(childData.sclassName)
        });

        console.log("Successfully fetched child data:", {
            childId: child._id,
            childName: child.name,
            classId: child.sclassName?._id,
            className: child.sclassName?.sclassName,
            schoolName: child.school?.schoolName,
            attendanceCount: child.attendance?.length || 0,
            examResultCount: child.examResult?.length || 0
        });

        res.send(childData);
    } catch (err) {
        console.error("getMyChild error:", err);
        res.status(500).send({ 
            message: "Server error while fetching child",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const deleteParent = async (req, res) => {
    try {
        const parent = await Parent.findById(req.params.id);
        if (parent && parent.child) {
            await Student.findByIdAndUpdate(parent.child, {
                $unset: { parent: "" }
            });
        }

        const result = await Parent.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteParents = async (req, res) => {
    try {
        const parents = await Parent.find({ school: req.params.id });
        const studentUpdates = parents.map(parent => {
            if (parent.child) {
                return Student.findByIdAndUpdate(parent.child, {
                    $unset: { parent: "" }
                });
            }
            return Promise.resolve();
        });
        await Promise.all(studentUpdates);

        const result = await Parent.deleteMany({ 
            school: req.params.id,
            role: 'Parent'
        });
        
        if (result.deletedCount === 0) {
            res.send({ message: "No parents found to delete" });
        } else {
            res.send(result);
        }
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteParentsByClass = async (req, res) => {
    try {
        const parents = await Parent.find({ sclassName: req.params.id });
        const studentUpdates = parents.map(parent => {
            if (parent.child) {
                return Student.findByIdAndUpdate(parent.child, {
                    $unset: { parent: "" }
                });
            }
            return Promise.resolve();
        });
        await Promise.all(studentUpdates);

        const result = await Parent.deleteMany({ 
            sclassName: req.params.id,
            role: 'Parent'
        });
        
        if (result.deletedCount === 0) {
            res.send({ message: "No parents found to delete" });
        } else {
            res.send(result);
        }
    } catch (error) {
        res.status(500).json(error);
    }
};

const updateParent = async (req, res) => {
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }

        if (req.body.child) {
            const existingParent = await Parent.findOne({
                child: req.body.child,
                _id: { $ne: req.params.id },
                role: 'Parent'
            });
            
            if (existingParent) {
                return res.send({ message: 'Student already assigned to another parent' });
            }

            const currentParent = await Parent.findById(req.params.id);
            if (currentParent.child && currentParent.child.toString() !== req.body.child) {
                await Student.findByIdAndUpdate(currentParent.child, {
                    $unset: { parent: "" }
                });
            }

            await Student.findByIdAndUpdate(req.body.child, {
                parent: req.params.id
            });
        }

        let result = await Parent.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        result.password = undefined;
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};





const getParentResults = async (req, res) => {
    try {
        const parentId = req.params.parentId;
        const parent = await Parent.findById(parentId);
        if (!parent) return res.status(404).json({ message: "Parent not found" });

        const results = await Result.find({ parent: parentId }).sort({ uploadDate: -1 });

        const formattedResults = results.map(r => ({
            _id: r._id,
            fileUrl: r.filePath, // make sure this matches the field in MongoDB
            originalName: r.originalName,
            uploadedAt: r.uploadDate
        }));

        res.json(formattedResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error fetching results" });
    }
};



// ===== New controller function to get complaints by user ID =====
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

module.exports = {
    parentRegister,
    parentLogIn,
    getParents,
    getParentDetail,
    deleteParents,
    deleteParent,
    updateParent,
    getMyChild,
    deleteParentsByClass,
    getParentResults,

    // Export new complaint controller
    getComplainsByUser,
};
