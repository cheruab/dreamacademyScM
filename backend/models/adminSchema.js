const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: { 
        type: String, 
        default: "Admin",
        immutable: true // Prevent role changes
    },
    schoolName: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    },
    lastPasswordChange: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt
});

// 🚨 Enforce only one document in the "admins" collection
adminSchema.pre("save", async function (next) {
    // Skip this check if we're updating an existing admin
    if (!this.isNew) {
        return next();
    }

    const Admin = mongoose.model("admin", adminSchema);
    const count = await Admin.countDocuments();
    
    if (count > 0) {
        const err = new Error("You cannot register as an admin. There is only one admin allowed.");
        err.name = "AdminExistsError";
        err.status = 400;
        return next(err);
    }
    next();
});

// Index for better performance
adminSchema.index({ email: 1 }, { unique: true });

// Instance method to check if password was recently changed
adminSchema.methods.isPasswordRecentlyChanged = function() {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return this.lastPasswordChange > threeDaysAgo;
};

// Static method to get the single admin
adminSchema.statics.getSingleAdmin = async function() {
    return await this.findOne({});
};

// Static method to check if admin exists
adminSchema.statics.adminExists = async function() {
    const count = await this.countDocuments();
    return count > 0;
};

module.exports = mongoose.model("admin", adminSchema);